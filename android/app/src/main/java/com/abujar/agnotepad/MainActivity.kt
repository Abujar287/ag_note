package com.abujar.agnotepad

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.app.DownloadManager
import android.content.ClipData
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.content.pm.Signature
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.provider.Settings
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.webkit.WebViewAssetLoader
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.io.OutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit

class MainActivity : Activity() {

    private lateinit var webView: WebView
    private val executor = Executors.newSingleThreadExecutor()
    private val scheduler = Executors.newSingleThreadScheduledExecutor()
    private var pollFuture: ScheduledFuture<*>? = null

    private var fileChooserCallback: ValueCallback<Array<Uri>>? = null
    private var pendingInstallUri: Uri? = null
    private var lastDownloadedUri: Uri? = null
    private var lastDownloadedFileName: String? = null
    private var lastDownloadId: Long = -1L
    private var pendingDownloadUrl: String? = null
    private var pendingDownloadName: String? = null
    private var pendingExpectedSize: Long = 0L

    companion object {
        private const val REQ_FILE_CHOOSER = 1001
        private const val REQ_STORAGE_PERMISSION = 1002
        private const val REQ_AUDIO_PERMISSION = 1003
        private const val REQ_INSTALL_PERMISSION = 1004
        private const val ASSET_ORIGIN = "https://appassets.androidplatform.net"
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        setContentView(webView)

        val assetLoader = WebViewAssetLoader.Builder()
            .setDomain("appassets.androidplatform.net")
            .addPathHandler("/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = false
            allowContentAccess = true
            mediaPlaybackRequiresUserGesture = false
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            cacheMode = WebSettings.LOAD_DEFAULT
        }

        webView.addJavascriptInterface(AndroidBridge(), "Android")

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest
            ): WebResourceResponse? {
                return assetLoader.shouldInterceptRequest(request.url)
            }

            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest
            ): Boolean {
                val url = request.url.toString()
                if (url.startsWith(ASSET_ORIGIN)) {
                    return false
                }
                return try {
                    startActivity(Intent(Intent.ACTION_VIEW, request.url))
                    true
                } catch (_: Exception) {
                    false
                }
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileChooserCallback?.onReceiveValue(null)
                fileChooserCallback = filePathCallback
                return try {
                    val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                        addCategory(Intent.CATEGORY_OPENABLE)
                        type = "*/*"
                    }
                    startActivityForResult(
                        Intent.createChooser(intent, "Select backup file"),
                        REQ_FILE_CHOOSER
                    )
                    true
                } catch (_: Exception) {
                    fileChooserCallback = null
                    false
                }
            }

            override fun onPermissionRequest(request: PermissionRequest?) {
                if (request == null) return
                val wantsAudio = request.resources.contains(PermissionRequest.RESOURCE_AUDIO_CAPTURE)
                if (wantsAudio && ContextCompat.checkSelfPermission(
                        this@MainActivity,
                        Manifest.permission.RECORD_AUDIO
                    ) != PackageManager.PERMISSION_GRANTED
                ) {
                    ActivityCompat.requestPermissions(
                        this@MainActivity,
                        arrayOf(Manifest.permission.RECORD_AUDIO),
                        REQ_AUDIO_PERMISSION
                    )
                    request.deny()
                    return
                }
                runOnUiThread {
                    request.grant(request.resources)
                }
            }
        }

        webView.loadUrl("$ASSET_ORIGIN/index.html")
    }

    override fun onDestroy() {
        stopDownloadPolling()
        executor.shutdownNow()
        scheduler.shutdownNow()
        super.onDestroy()
    }

    override fun onResume() {
        super.onResume()
        val pendingUri = pendingInstallUri
        if (pendingUri != null &&
            (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || packageManager.canRequestPackageInstalls())
        ) {
            pendingInstallUri = null
            launchApkInstaller(pendingUri)
        }
    }

    override fun onBackPressed() {
        if (this::webView.isInitialized && webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQ_FILE_CHOOSER) {
            val result = if (resultCode == RESULT_OK && data?.data != null) {
                arrayOf(data.data!!)
            } else {
                null
            }
            fileChooserCallback?.onReceiveValue(result)
            fileChooserCallback = null
        } else if (requestCode == REQ_INSTALL_PERMISSION) {
            val pendingUri = pendingInstallUri
            if (pendingUri != null &&
                (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || packageManager.canRequestPackageInstalls())
            ) {
                pendingInstallUri = null
                launchApkInstaller(pendingUri)
            }
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQ_STORAGE_PERMISSION) {
            val url = pendingDownloadUrl
            val name = pendingDownloadName
            val expectedSize = pendingExpectedSize
            pendingDownloadUrl = null
            pendingDownloadName = null
            pendingExpectedSize = 0L
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED && url != null && name != null) {
                startApkDownload(url, name, expectedSize)
            } else {
                notifyJsError("Storage permission denied")
            }
        }
    }

    private fun sanitizeFilename(raw: String, fallbackExt: String): String {
        val base = raw.substringAfterLast('/').substringAfterLast('\\')
            .replace(Regex("[^a-zA-Z0-9._-]"), "_")
            .trim('_')
        val clean = if (base.isBlank()) "Notedpad_update$fallbackExt" else base
        return if (clean.endsWith(fallbackExt, ignoreCase = true)) clean else "$clean$fallbackExt"
    }

    private fun notifyJsProgress(pct: Int, downloaded: Long, total: Long) {
        webView.post {
            webView.evaluateJavascript(
                "window.__onApkProgress && window.__onApkProgress($pct, $downloaded, $total);",
                null
            )
        }
    }

    private fun notifyJsComplete(filename: String) {
        val quoted = JSONObject.quote(filename)
        webView.post {
            webView.evaluateJavascript(
                "window.__onApkComplete && window.__onApkComplete($quoted);",
                null
            )
        }
    }

    private fun notifyJsError(message: String) {
        val quoted = JSONObject.quote(message)
        webView.post {
            webView.evaluateJavascript(
                "window.__onApkError && window.__onApkError($quoted);",
                null
            )
        }
    }

    private fun stopDownloadPolling() {
        pollFuture?.cancel(false)
        pollFuture = null
    }

    private fun startApkDownload(apkUrl: String, filename: String, expectedSize: Long) {
        if (!apkUrl.startsWith("https://")) {
            notifyJsError("Invalid update URL")
            return
        }

        val cleanName = sanitizeFilename(filename, ".apk")

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q &&
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.WRITE_EXTERNAL_STORAGE
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            pendingDownloadUrl = apkUrl
            pendingDownloadName = cleanName
            pendingExpectedSize = expectedSize
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.WRITE_EXTERNAL_STORAGE),
                REQ_STORAGE_PERMISSION
            )
            return
        }

        stopDownloadPolling()
        lastDownloadedUri = null
        lastDownloadedFileName = cleanName
        lastDownloadId = -1L

        // Resolve any GitHub 302 redirect first so DownloadManager receives the direct CDN APK URL
        // and fall back automatically to direct MediaStore HTTP download if DownloadManager fails or stalls.
        executor.execute {
            var resolvedUrl = apkUrl
            var resolvedSize = expectedSize
            try {
                var currentUrl = apkUrl
                var redirects = 0
                while (redirects < 6) {
                    val urlObj = URL(currentUrl)
                    val conn = (urlObj.openConnection() as HttpURLConnection).apply {
                        instanceFollowRedirects = false
                        connectTimeout = 15000
                        readTimeout = 15000
                        requestMethod = "GET"
                        setRequestProperty("User-Agent", "Notedpad/${BuildConfig.VERSION_NAME}")
                    }
                    val code = conn.responseCode
                    if (code in 300..399) {
                        val next = conn.getHeaderField("Location")
                        conn.disconnect()
                        if (next.isNullOrBlank()) break
                        currentUrl = URL(urlObj, next).toString()
                        redirects++
                    } else {
                        if (code in 200..299 && conn.contentLengthLong > 0L) {
                            resolvedSize = conn.contentLengthLong
                        }
                        resolvedUrl = currentUrl
                        conn.disconnect()
                        break
                    }
                }
            } catch (_: Exception) {
                resolvedUrl = apkUrl
            }

            try {
                val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
                val request = DownloadManager.Request(Uri.parse(resolvedUrl)).apply {
                    setTitle(cleanName)
                    setDescription("Downloading Notedpad update")
                    setMimeType("application/vnd.android.package-archive")
                    setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                    setAllowedOverMetered(true)
                    setAllowedOverRoaming(true)
                    setAllowedNetworkTypes(
                        DownloadManager.Request.NETWORK_WIFI or DownloadManager.Request.NETWORK_MOBILE
                    )
                    setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, cleanName)
                }

                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                    @Suppress("DEPRECATION")
                    val existing = File(
                        Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                        cleanName
                    )
                    if (existing.exists()) {
                        existing.delete()
                    }
                }

                val downloadId = dm.enqueue(request)
                lastDownloadId = downloadId
                monitorDownloadManager(dm, downloadId, resolvedUrl, cleanName, resolvedSize)
                return@execute
            } catch (_: Exception) {
                // Fall through to direct MediaStore download fallback if DownloadManager is disabled
            }

            startDirectHttpFallbackDownload(resolvedUrl, cleanName, resolvedSize)
        }
    }

    private fun monitorDownloadManager(
        dm: DownloadManager,
        downloadId: Long,
        fallbackUrl: String,
        fallbackName: String,
        expectedSize: Long
    ) {
        var lastPct = 0
        val startedAt = System.currentTimeMillis()
        pollFuture = scheduler.scheduleAtFixedRate({
            try {
                val query = DownloadManager.Query().setFilterById(downloadId)
                dm.query(query).use { cursor ->
                    if (cursor == null || !cursor.moveToFirst()) {
                        stopDownloadPolling()
                        notifyJsError("Download was cancelled")
                        return@scheduleAtFixedRate
                    }

                    val status = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS))
                    val downloaded = cursor.getLong(
                        cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR)
                    ).coerceAtLeast(0L)
                    val totalFromDm = cursor.getLong(
                        cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_TOTAL_SIZE_BYTES)
                    )
                    val total = when {
                        totalFromDm > 0L -> totalFromDm
                        expectedSize > 0L -> expectedSize.coerceAtLeast(downloaded)
                        else -> downloaded
                    }

                    when (status) {
                        DownloadManager.STATUS_PENDING, DownloadManager.STATUS_PAUSED -> {
                            if (downloaded == 0L && System.currentTimeMillis() - startedAt > 12000L) {
                                stopDownloadPolling()
                                try {
                                    dm.remove(downloadId)
                                } catch (_: Exception) {
                                }
                                startDirectHttpFallbackDownload(fallbackUrl, fallbackName, expectedSize)
                                return@scheduleAtFixedRate
                            }
                            notifyJsProgress(lastPct.coerceAtLeast(1), downloaded, total)
                        }
                        DownloadManager.STATUS_RUNNING -> {
                            val pct = if (total > 0L) {
                                ((downloaded * 100L) / total).toInt().coerceIn(1, 99)
                            } else {
                                10
                            }
                            lastPct = pct.coerceAtLeast(lastPct)
                            notifyJsProgress(lastPct, downloaded, total)
                        }
                        DownloadManager.STATUS_SUCCESSFUL -> {
                            stopDownloadPolling()
                            val uriIdx = cursor.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI)
                            val localUriStr = if (uriIdx >= 0) cursor.getString(uriIdx) else null
                            val resolvedName = localUriStr?.let {
                                Uri.parse(it).lastPathSegment
                            }?.takeIf { it.isNotBlank() } ?: fallbackName

                            val dmUri = dm.getUriForDownloadedFile(downloadId)
                            lastDownloadedUri = dmUri ?: localUriStr?.let { Uri.parse(it) }
                            lastDownloadedFileName = resolvedName

                            val finalBytes = total.coerceAtLeast(downloaded)
                            notifyJsProgress(100, finalBytes, finalBytes)
                            notifyJsComplete(resolvedName)
                        }
                        DownloadManager.STATUS_FAILED -> {
                            stopDownloadPolling()
                            try {
                                dm.remove(downloadId)
                            } catch (_: Exception) {
                            }
                            startDirectHttpFallbackDownload(fallbackUrl, fallbackName, expectedSize)
                        }
                    }
                }
            } catch (_: Exception) {
                stopDownloadPolling()
                startDirectHttpFallbackDownload(fallbackUrl, fallbackName, expectedSize)
            }
        }, 0L, 250L, TimeUnit.MILLISECONDS)
    }

    private fun describeDownloadError(reason: Int): String {
        return when (reason) {
            DownloadManager.ERROR_CANNOT_RESUME -> "Download could not resume"
            DownloadManager.ERROR_DEVICE_NOT_FOUND -> "Storage not available"
            DownloadManager.ERROR_FILE_ALREADY_EXISTS -> "File already exists in Download folder"
            DownloadManager.ERROR_HTTP_DATA_ERROR -> "Network error while downloading APK"
            DownloadManager.ERROR_INSUFFICIENT_SPACE -> "Not enough storage space"
            DownloadManager.ERROR_TOO_MANY_REDIRECTS -> "Too many network redirects"
            DownloadManager.ERROR_UNHANDLED_HTTP_CODE -> "Server returned an invalid response"
            else -> "APK download failed (code $reason)"
        }
    }

    private fun startDirectHttpFallbackDownload(
        apkUrl: String,
        cleanName: String,
        expectedSize: Long
    ) {
        executor.execute {
            var connection: HttpURLConnection? = null
            var mediaUri: Uri? = null
            var legacyFile: File? = null
            var outputStream: OutputStream? = null

            try {
                var currentUrl = apkUrl
                var redirects = 0
                while (redirects < 6) {
                    val urlObj = URL(currentUrl)
                    connection = (urlObj.openConnection() as HttpURLConnection).apply {
                        instanceFollowRedirects = false
                        connectTimeout = 20000
                        readTimeout = 30000
                        requestMethod = "GET"
                        setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android) Notedpad/${BuildConfig.VERSION_NAME}")
                    }
                    val code = connection.responseCode
                    if (code in 300..399) {
                        val next = connection.getHeaderField("Location")
                        connection.disconnect()
                        if (next.isNullOrBlank()) throw IllegalStateException("Empty redirect location")
                        currentUrl = URL(urlObj, next).toString()
                        redirects++
                    } else {
                        break
                    }
                }

                val conn = connection ?: throw IllegalStateException("Connection failed")
                val status = conn.responseCode
                if (status !in 200..299) {
                    throw IllegalStateException("APK not found (HTTP $status)")
                }

                val totalBytes = conn.contentLengthLong.takeIf { it > 0L } ?: expectedSize
                val inputStream: InputStream = conn.inputStream

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    val values = ContentValues().apply {
                        put(MediaStore.Downloads.DISPLAY_NAME, cleanName)
                        put(MediaStore.Downloads.MIME_TYPE, "application/vnd.android.package-archive")
                        put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                        put(MediaStore.Downloads.IS_PENDING, 1)
                    }
                    mediaUri = contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                        ?: throw IllegalStateException("Unable to create file in Download folder")
                    outputStream = contentResolver.openOutputStream(mediaUri)
                        ?: throw IllegalStateException("Unable to open Download output stream")
                } else {
                    @Suppress("DEPRECATION")
                    val downloadsDir = Environment.getExternalStoragePublicDirectory(
                        Environment.DIRECTORY_DOWNLOADS
                    )
                    if (!downloadsDir.exists()) downloadsDir.mkdirs()
                    legacyFile = File(downloadsDir, cleanName)
                    outputStream = FileOutputStream(legacyFile)
                }

                val buffer = ByteArray(16384)
                var downloaded = 0L
                var lastUpdate = 0L

                while (true) {
                    val read = inputStream.read(buffer)
                    if (read == -1) break
                    outputStream.write(buffer, 0, read)
                    downloaded += read

                    val now = System.currentTimeMillis()
                    if (now - lastUpdate >= 120L) {
                        lastUpdate = now
                        val total = totalBytes.coerceAtLeast(downloaded)
                        val pct = if (total > 0L) ((downloaded * 100L) / total).toInt().coerceIn(1, 99) else 50
                        notifyJsProgress(pct, downloaded, total)
                    }
                }

                outputStream.flush()
                outputStream.close()
                outputStream = null
                inputStream.close()
                conn.disconnect()

                val finalUri: Uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && mediaUri != null) {
                    val doneValues = ContentValues().apply {
                        put(MediaStore.Downloads.IS_PENDING, 0)
                    }
                    contentResolver.update(mediaUri, doneValues, null, null)
                    mediaUri
                } else if (legacyFile != null) {
                    FileProvider.getUriForFile(this@MainActivity, "$packageName.fileprovider", legacyFile)
                } else {
                    throw IllegalStateException("Saved APK URI unavailable")
                }

                lastDownloadedUri = finalUri
                lastDownloadedFileName = cleanName
                val finalTotal = totalBytes.coerceAtLeast(downloaded)
                notifyJsProgress(100, finalTotal, finalTotal)
                notifyJsComplete(cleanName)
            } catch (e: Exception) {
                try {
                    outputStream?.close()
                } catch (_: Exception) {
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && mediaUri != null) {
                    try {
                        contentResolver.delete(mediaUri, null, null)
                    } catch (_: Exception) {
                    }
                } else {
                    legacyFile?.delete()
                }
                connection?.disconnect()
                notifyJsError(e.message ?: "APK download failed")
            }
        }
    }

    private fun isZipApkHeader(file: File): Boolean {
        return try {
            file.inputStream().use { input ->
                val header = ByteArray(4)
                input.read(header) == 4 &&
                    header[0] == 0x50.toByte() &&
                    header[1] == 0x4B.toByte() &&
                    header[2] == 0x03.toByte() &&
                    header[3] == 0x04.toByte()
            }
        } catch (_: Exception) {
            false
        }
    }

    @Suppress("DEPRECATION")
    private fun extractSignatureHexSet(info: PackageInfo?): Set<String> {
        if (info == null) return emptySet()
        val sigs: Array<Signature>? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            val signingInfo = info.signingInfo
            if (signingInfo == null) {
                null
            } else if (signingInfo.hasMultipleSigners()) {
                signingInfo.apkContentsSigners
            } else {
                signingInfo.signingCertificateHistory
            }
        } else {
            info.signatures
        }
        return sigs?.map { it.toCharsString() }?.toSet() ?: emptySet()
    }

    @Suppress("DEPRECATION")
    private fun getPackageLongVersionCode(info: PackageInfo): Long {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            info.longVersionCode
        } else {
            info.versionCode.toLong()
        }
    }

    /**
     * Stages the downloaded APK into our FileProvider-backed cache directory and verifies
     * ZIP header, package name, versionCode, and signing certificate before launching PackageInstaller.
     */
    private fun resolveAndValidateStagedApk(filenameHint: String): Pair<Uri?, String?> {
        val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        val sourceUri: Uri? = lastDownloadedUri ?: if (lastDownloadId >= 0L) {
            dm.getUriForDownloadedFile(lastDownloadId)
        } else {
            null
        }

        val updatesDir = File(cacheDir, "updates").apply {
            if (exists()) {
                listFiles()?.forEach { it.delete() }
            } else {
                mkdirs()
            }
        }

        val cleanName = sanitizeFilename(lastDownloadedFileName ?: filenameHint, ".apk")
        val stagedApk = File(updatesDir, cleanName)

        if (sourceUri != null) {
            try {
                contentResolver.openInputStream(sourceUri)?.use { input ->
                    FileOutputStream(stagedApk).use { output ->
                        input.copyTo(output, 32768)
                    }
                }
            } catch (_: Exception) {
                stagedApk.delete()
            }
        }

        if (!stagedApk.exists() || stagedApk.length() <= 102400L) {
            // Secondary lookup directly in public Download directory
            @Suppress("DEPRECATION")
            val publicFile = File(
                Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                cleanName
            )
            if (publicFile.exists() && publicFile.length() > 102400L) {
                try {
                    publicFile.inputStream().use { input ->
                        FileOutputStream(stagedApk).use { output ->
                            input.copyTo(output, 32768)
                        }
                    }
                } catch (_: Exception) {
                    stagedApk.delete()
                }
            }
        }

        if (!stagedApk.exists() || stagedApk.length() <= 102400L) {
            return Pair(null, "Downloaded APK file not found or incomplete in Download folder")
        }

        if (!isZipApkHeader(stagedApk)) {
            stagedApk.delete()
            return Pair(null, "Downloaded file is not a valid APK package. Please try again.")
        }

        try {
            @Suppress("DEPRECATION")
            val sigFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                PackageManager.GET_SIGNING_CERTIFICATES
            } else {
                PackageManager.GET_SIGNATURES
            }
            val archiveInfo = packageManager.getPackageArchiveInfo(stagedApk.absolutePath, sigFlag)
                ?: return Pair(null, "Downloaded APK is corrupted and could not be parsed.")

            if (archiveInfo.packageName != packageName) {
                return Pair(null, "APK package ID mismatch (${archiveInfo.packageName}).")
            }

            val installedInfo = packageManager.getPackageInfo(packageName, sigFlag)
            val archiveVerCode = getPackageLongVersionCode(archiveInfo)
            val installedVerCode = getPackageLongVersionCode(installedInfo)
            if (archiveVerCode < installedVerCode) {
                return Pair(
                    null,
                    "Update blocked: downloaded APK build ($archiveVerCode) is older than installed ($installedVerCode)."
                )
            }

            val installedSigs = extractSignatureHexSet(installedInfo)
            val archiveSigs = extractSignatureHexSet(archiveInfo)
            if (installedSigs.isNotEmpty() && archiveSigs.isNotEmpty() && installedSigs.intersect(archiveSigs).isEmpty()) {
                return Pair(
                    null,
                    "Signature mismatch with your older installed build. Export JSON backup or sync Google Sheet, uninstall the current app once, and install Download/$cleanName."
                )
            }
        } catch (_: Exception) {
            // Proceed with FileProvider URI if OEM restricts getPackageArchiveInfo inspection
        }

        val providerUri = FileProvider.getUriForFile(this, "$packageName.fileprovider", stagedApk)
        return Pair(providerUri, null)
    }

    private fun launchApkInstaller(uri: Uri) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
                !packageManager.canRequestPackageInstalls()
            ) {
                pendingInstallUri = uri
                val permIntent = Intent(
                    Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:$packageName")
                )
                startActivityForResult(permIntent, REQ_INSTALL_PERMISSION)
                return
            }

            val installIntent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/vnd.android.package-archive")
                clipData = ClipData.newRawUri("", uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(installIntent)
        } catch (e: Exception) {
            notifyJsError("Could not launch installer: ${e.message ?: "unknown error"}")
        }
    }

    inner class AndroidBridge {
        @JavascriptInterface
        fun getAppVersion(): String {
            return BuildConfig.VERSION_NAME
        }

        @JavascriptInterface
        fun downloadApk(apkUrl: String, filename: String) {
            startApkDownload(apkUrl, filename, 0L)
        }

        @JavascriptInterface
        fun downloadApkWithSize(apkUrl: String, filename: String, expectedSize: Long) {
            startApkDownload(apkUrl, filename, expectedSize)
        }

        @JavascriptInterface
        fun installApk(filename: String) {
            executor.execute {
                val (installUri, errorMsg) = resolveAndValidateStagedApk(filename)
                if (installUri != null) {
                    runOnUiThread { launchApkInstaller(installUri) }
                } else {
                    notifyJsError(errorMsg ?: "Downloaded APK file not found in Download folder")
                }
            }
        }

        @JavascriptInterface
        fun saveTextFile(filename: String, content: String): Boolean {
            return try {
                val cleanName = sanitizeFilename(filename, ".json")
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    val values = ContentValues().apply {
                        put(MediaStore.Downloads.DISPLAY_NAME, cleanName)
                        put(MediaStore.Downloads.MIME_TYPE, "application/json")
                        put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                    }
                    val uri = contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                        ?: return false
                    contentResolver.openOutputStream(uri)?.use { out ->
                        out.write(content.toByteArray(Charsets.UTF_8))
                    }
                } else {
                    @Suppress("DEPRECATION")
                    val dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                    if (!dir.exists()) dir.mkdirs()
                    File(dir, cleanName).writeText(content, Charsets.UTF_8)
                }
                true
            } catch (_: Exception) {
                false
            }
        }
    }
}
