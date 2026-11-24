import java.io.File

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val appVersionCode = (project.findProperty("VERSION_CODE") as String?)?.toIntOrNull() ?: 3
val appVersionName = (project.findProperty("VERSION_NAME") as String?) ?: "1.2.1"

android {
    namespace = "com.abujar.agnotepad"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.abujar.agnotepad"
        minSdk = 24
        targetSdk = 35
        versionCode = appVersionCode
        versionName = appVersionName
    }

    buildFeatures {
        buildConfig = true
    }

    signingConfigs {
        create("release") {
            val keystorePath = System.getenv("ANDROID_KEYSTORE_PATH")
                ?: (project.findProperty("RELEASE_STORE_FILE") as String?)
                ?: "release.jks"
            val keystoreFile = file(keystorePath)
            if (keystoreFile.exists()) {
                storeFile = keystoreFile
                storePassword = System.getenv("ANDROID_STORE_PASSWORD")
                    ?: (project.findProperty("RELEASE_STORE_PASSWORD") as String?)
                    ?: "notedpad123"
                keyAlias = System.getenv("ANDROID_KEY_ALIAS")
                    ?: (project.findProperty("RELEASE_KEY_ALIAS") as String?)
                    ?: "notedpad"
                keyPassword = System.getenv("ANDROID_KEY_PASSWORD")
                    ?: (project.findProperty("RELEASE_KEY_PASSWORD") as String?)
                    ?: "notedpad123"
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            val releaseSigning = signingConfigs.getByName("release")
            if (releaseSigning.storeFile != null && releaseSigning.storeFile!!.exists()) {
                signingConfig = releaseSigning
            }
        }
        debug {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    packaging {
        resources {
            excludes += setOf(
                "META-INF/LICENSE*",
                "META-INF/NOTICE*",
                "META-INF/*.kotlin_module",
                "kotlin/**",
                "DebugProbesKt.bin"
            )
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.webkit:webkit:1.12.1")
}
