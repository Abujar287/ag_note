package com.abujar.agnotepad

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.ContentValues
import android.content.Intent
import android.content.pm.PackageManager
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

class MainActivity : Activity() {

    private lateinit var webView: WebView
    private val executor = Executors.newSingleThreadExecutor()

    private var fileChooserCallback: ValueCallback<Array<Uri>>? = null
    private var pendingInstallUri: Uri? = null
    private var lastDownloadedApkUri: Uri? = null
    private var pendingDownloadUrl: String? = null
    private var pendingDownloadName: String? = null

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
            pendingDownloadUrl = null
            pendingDownloadName = null
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED && url != null && name != null) {
                startApkDownload(url, name)
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

    private fun startApkDownload(apkUrl: String, filename: String) {
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
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.WRITE_EXTERNAL_STORAGE),
                REQ_STORAGE_PERMISSION
            )
            return
        }

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
                        setRequestProperty("User-Agent", "Notedpad-Android/${BuildConfig.VERSION_NAME}")
                    }
                    val code = connection.responseCode
                    if (code in 300..399) {
                        val next = connection.getHeaderField("Location")
                        connection.disconnect()
                        if (next.isNullOrBlank()) {
                            throw IllegalStateException("Empty redirect location")
                        }
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

                val totalBytes = conn.contentLengthLong.takeIf { it > 0L } ?: 0L
                val inputStream: InputStream = conn.inputStream

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    val values = ContentValues().apply {
                        put(MediaStore.Downloads.DISPLAY_NAME, cleanName)
                        put(MediaStore.Downloads.MIME_TYPE, "application/vnd.android.package-archive")
                        put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                        put(MediaStore.Downloads.IS_PENDING, 1)
                    }
                    val resolver = contentResolver
                    mediaUri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                        ?: throw IllegalStateException("Unable to create file in Download folder")
                    outputStream = resolver.openOutputStream(mediaUri)
                        ?: throw IllegalStateException("Unable to open Download output stream")
                } else {
                    @Suppress("DEPRECATION")
                    val downloadsDir = Environment.getExternalStoragePublicDirectory(
                        Environment.DIRECTORY_DOWNLOADS
                    )
                    if (!downloadsDir.exists()) {
                        downloadsDir.mkdirs()
                    }
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
                    if (now - lastUpdate >= 100L) {
                        lastUpdate = now
                        val pct = if (totalBytes > 0) {
                            ((downloaded * 100L) / totalBytes).toInt().coerceIn(1, 99)
                        } else {
                            50
                        }
                        notifyJsProgress(pct, downloaded, totalBytes.coerceAtLeast(downloaded))
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
                    FileProvider.getUriForFile(
                        this@MainActivity,
                        "$packageName.fileprovider",
                        legacyFile
                    )
                } else {
                    throw IllegalStateException("Saved APK URI unavailable")
                }

                lastDownloadedApkUri = finalUri
                notifyJsProgress(100, downloaded, totalBytes.coerceAtLeast(downloaded))
                notifyJsComplete(cleanName)

                runOnUiThread {
                    launchApkInstaller(finalUri)
                }
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
            startApkDownload(apkUrl, filename)
        }

        @JavascriptInterface
        fun installApk(filename: String) {
            val uri = lastDownloadedApkUri
            if (uri != null) {
                runOnUiThread { launchApkInstaller(uri) }
                return
            }
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                val cleanName = sanitizeFilename(filename, ".apk")
                @Suppress("DEPRECATION")
                val file = File(
                    Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                    cleanName
                )
                if (file.exists()) {
                    val fileUri = FileProvider.getUriForFile(
                        this@MainActivity,
                        "$packageName.fileprovider",
                        file
                    )
                    runOnUiThread { launchApkInstaller(fileUri) }
                    return
                }
            }
            notifyJsError("Downloaded APK file not found")
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
