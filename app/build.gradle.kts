import com.google.gms.googleservices.GoogleServicesPlugin.MissingGoogleServicesStrategy

plugins {
  alias(libs.plugins.android.application)
  alias(libs.plugins.kotlin.compose)
  alias(libs.plugins.google.devtools.ksp)
  alias(libs.plugins.secrets)
  alias(libs.plugins.google.services)
}

android {
  namespace = "com.example"
  compileSdk { version = release(36) { minorApiLevel = 1 } }

  defaultConfig {
    applicationId = "com.aistudio.arbook.kxywzp"
    minSdk = 24
    targetSdk = 36
    versionCode = 16
    versionName = "16.0"

    testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
  }

  signingConfigs {
    create("release") {
      val envPath = System.getenv("KEYSTORE_PATH")
      val keystoreFile = if (envPath != null) file(envPath) else file("${rootDir}/my-upload-key.jks")
      if (keystoreFile.exists()) {
        storeFile = keystoreFile
        storePassword = System.getenv("STORE_PASSWORD")
        keyAlias = "upload"
        keyPassword = System.getenv("KEY_PASSWORD")
      } else {
        storeFile = file("${rootDir}/debug.keystore")
        storePassword = "android"
        keyAlias = "androiddebugkey"
        keyPassword = "android"
      }
    }
    create("debugConfig") {
      storeFile = file("${rootDir}/debug.keystore")
      storePassword = "android"
      keyAlias = "androiddebugkey"
      keyPassword = "android"
    }
  }

  buildTypes {
    release {
      isCrunchPngs = false
      // R8: shrinks, optimises and obfuscates the code (smaller app, required by Google Play's
      // "DEX code optimisation" check). The JavaScript bridge is kept in proguard-rules.pro.
      isMinifyEnabled = true
      isShrinkResources = true
      proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
      signingConfig = signingConfigs.getByName("release")
    }
    debug { signingConfig = signingConfigs.getByName("debugConfig") }
  }
  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
  }
  buildFeatures {
    compose = true
    buildConfig = true
  }
  testOptions { unitTests { isIncludeAndroidResources = true } }
  lint {
    abortOnError = false
    checkReleaseBuilds = false
    disable.add("InvalidFragmentVersionForActivityResult")
  }
  dependenciesInfo {
    includeInApk = false
    includeInBundle = true
  }
}

// Configure the Secrets Gradle Plugin to use .env and .env.example files
// to match the convention used in Web projects.
secrets {
  propertiesFileName = ".env"
  defaultPropertiesFileName = ".env.example"
  ignoreList.add("FIREBASE_APPCHECK_DEBUG_TOKEN")
}

googleServices { missingGoogleServicesStrategy = MissingGoogleServicesStrategy.WARN }

// Some unused dependencies are commented out below instead of being removed.
// This makes it easy to add them back in the future if needed.
// Firebase, Room, Retrofit, Moshi and OkHttp from the project template were removed: the app does
// not use them, and Firebase pulled in Google Play services with the outdated
// androidx.fragment 1.1.0 that Google Play warns about.
configurations.all {
  resolutionStrategy {
    force("androidx.fragment:fragment:1.8.6")
    force("androidx.fragment:fragment-ktx:1.8.6")
  }
}

dependencies {
  implementation(platform(libs.androidx.compose.bom))
  implementation(libs.androidx.fragment.ktx)
  implementation(libs.androidx.webkit)
  // implementation(libs.accompanist.permissions)
  implementation(libs.androidx.activity.compose)
  // implementation(libs.androidx.camera.camera2)
  // implementation(libs.androidx.camera.core)
  // implementation(libs.androidx.camera.lifecycle)
  // implementation(libs.androidx.camera.view)
  implementation(libs.androidx.compose.material.icons.core)
  implementation(libs.androidx.compose.material.icons.extended)
  implementation(libs.androidx.compose.material3)
  implementation(libs.androidx.compose.ui)
  implementation(libs.androidx.compose.ui.graphics)
  implementation(libs.androidx.compose.ui.tooling.preview)
  implementation(libs.androidx.core.ktx)
  // implementation(libs.androidx.datastore.preferences)
  implementation(libs.androidx.lifecycle.runtime.compose)
  implementation(libs.androidx.lifecycle.runtime.ktx)
  implementation(libs.androidx.lifecycle.viewmodel.compose)
  // implementation(libs.androidx.navigation.compose)
  // implementation(libs.coil.compose)
  // Uncomment to use Firestore:
  // implementation(libs.firebase.firestore)

  // Uncomment ALL FOUR of the following dependencies together to use Firebase Auth and Google
  // Sign-In via Credential Manager:
  // implementation(libs.firebase.auth)
  // implementation(libs.androidx.credentials)
  // implementation(libs.androidx.credentials.play.services)
  // implementation(libs.googleid)
  implementation(libs.kotlinx.coroutines.android)
  implementation(libs.kotlinx.coroutines.core)
  // implementation(libs.play.services.location)
  testImplementation(libs.androidx.compose.ui.test.junit4)
  testImplementation(libs.androidx.core)
  testImplementation(libs.androidx.junit)
  testImplementation(libs.junit)
  testImplementation(libs.kotlinx.coroutines.test)
  testImplementation(libs.robolectric)
  androidTestImplementation(platform(libs.androidx.compose.bom))
  androidTestImplementation(libs.androidx.compose.ui.test.junit4)
  androidTestImplementation(libs.androidx.espresso.core)
  androidTestImplementation(libs.androidx.junit)
  androidTestImplementation(libs.androidx.runner)
  debugImplementation(libs.androidx.compose.ui.test.manifest)
  debugImplementation(libs.androidx.compose.ui.tooling)
}

// ---------------------------------------------------------------------------------------------
// Content inside the APK (hybrid): the first pages of the published content, up to 120 MB, are
// downloaded from the content server (R2 via the Worker, VITE_CONTENT_API) while the app is built, so they work offline straight after install. The
// app downloads the rest in the background and replaces changed files (SHA-256) by itself.
// Runs in every build environment (AI Studio, Android Studio), no `npm run build` needed. Same rules
// as web-app/scripts/bundle-content.mjs; content prepared by that script (in src/main/assets) wins.
// The limit can be changed with CONTENT_BUNDLE_MB in web-app/.env.local.
// ---------------------------------------------------------------------------------------------

abstract class BundleContentTask : DefaultTask() {
  @get:Input abstract val baseUrl: Property<String>
  @get:Input abstract val budgetMb: Property<Double>
  @get:Internal abstract val webContentDir: DirectoryProperty
  @get:OutputDirectory abstract val outputDir: DirectoryProperty

  init {
    // The online content changes without any change here: check it on every build
    outputs.upToDateWhen { false }
  }

  @TaskAction
  fun run() {
    val out = outputDir.get().asFile.resolve("www/content")
    if (webContentDir.get().asFile.resolve("manifest.json").exists()) {
      out.deleteRecursively()
      logger.lifecycle("[konten] Memakai konten dari npm run build (app/src/main/assets/www/content).")
      return
    }
    val base = baseUrl.get()
    if (base.isBlank()) {
      logger.warn("[konten] VITE_CONTENT_API belum diisi: APK tanpa konten bawaan.")
      return
    }
    try {
      fill(base, out)
    } catch (e: Exception) {
      logger.warn("[konten] PERINGATAN: konten online tidak bisa diambil (${e.message}).")
      logger.warn("[konten] Build tetap dilanjutkan dengan konten build sebelumnya (bila ada).")
    }
  }

  private fun fetch(url: String): Pair<Int, ByteArray?> {
    val c = java.net.URI(url).toURL().openConnection() as java.net.HttpURLConnection
    c.connectTimeout = 30_000
    c.readTimeout = 180_000
    c.setRequestProperty("Cache-Control", "no-cache")
    try {
      val code = c.responseCode
      return code to (if (code in 200..299) c.inputStream.use { it.readBytes() } else null)
    } finally {
      c.disconnect()
    }
  }

  private fun download(url: String): ByteArray {
    val (code, body) = fetch(url)
    return body ?: throw GradleException("$url: HTTP $code")
  }

  private fun sha256(bytes: ByteArray): String =
    java.security.MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it) }

  @Suppress("UNCHECKED_CAST")
  private fun fill(base: String, out: File) {
    logger.lifecycle("[konten] Mengambil konten terbaru dari $base")
    val (code, body) = fetch("${base}manifest.json?t=${System.currentTimeMillis()}")
    if (code == 400 || code == 404) {
      logger.lifecycle("[konten] Belum ada konten yang dipublikasikan.")
      return
    }
    if (body == null) throw GradleException("manifest.json: HTTP $code")
    val manifest = groovy.json.JsonSlurper().parse(body) as Map<String, Any?>
    val targets = manifest["targets"] as? List<Map<String, Any?>> ?: throw GradleException("manifest.json tidak valid")

    // Files of one sticker: path -> (SHA-256, size)
    fun filesOf(t: Map<String, Any?>): Map<String, Pair<String?, Long>> {
      val files = LinkedHashMap<String, Pair<String?, Long>>()
      fun add(file: Any?, sha: Any?, size: Any?) {
        if (file is String && file.isNotEmpty() && file !in files) files[file] = (sha as? String) to ((size as? Number)?.toLong() ?: 0L)
      }
      add(t["model"], t["modelSha"], t["modelSize"])
      (t["assets"] as? List<Map<String, Any?>>)?.forEach { add(it["file"], it["sha"], it["size"]) }
      (t["voices"] as? Map<String, Map<String, Any?>?>)?.values?.forEach { v -> if (v != null) add(v["file"], v["sha"], v["size"]) }
      (t["picture"] as? Map<String, Any?>)?.let { add(it["file"], it["sha"], it["size"]) }
      add(t["audio"], t["audioSha"], t["audioSize"])
      return files
    }

    // From the first page on, as long as it fits; a sticker that does not fit is skipped
    val budget = (budgetMb.get() * 1024 * 1024).toLong()
    val byPage = targets.sortedWith(
      compareBy<Map<String, Any?>> { (it["bookPage"] as? Number)?.toDouble() ?: Double.MAX_VALUE }.thenBy { it["qrCode"].toString() }
    )
    val files = LinkedHashMap<String, Pair<String?, Long>>()
    val included = mutableListOf<Map<String, Any?>>()
    val skipped = mutableListOf<Map<String, Any?>>()
    var planned = 0L
    for (t in byPage) {
      val own = filesOf(t).filterKeys { it !in files }
      val size = own.values.sumOf { it.second }
      if (planned + size > budget) {
        skipped += t
        continue
      }
      planned += size
      files.putAll(own)
      included += t
    }

    // Bigger files are stored online in parts (CHUNK_SIZE in web-app/src/services/cloudConfig.ts)
    val chunk = 45L * 1024 * 1024
    var downloaded = 0
    var kept = 0
    for ((rel, info) in files) {
      val (sha, size) = info
      val dest = out.resolve(rel)
      if (dest.exists() && sha != null && sha256(dest.readBytes()) == sha) {
        kept++
        continue
      }
      val bytes = if (size > chunk) {
        val parts = ((size + chunk - 1) / chunk).toInt()
        (0 until parts).map { download("$base$rel.part$it") }.reduce { a, b -> a + b }
      } else {
        download("$base$rel")
      }
      if (sha != null && sha256(bytes) != sha) throw GradleException("$rel: isi file tidak cocok dengan manifest")
      dest.parentFile.mkdirs()
      val tmp = File(dest.path + ".tmp")
      tmp.writeBytes(bytes)
      dest.delete()
      tmp.renameTo(dest) || throw GradleException("$rel: tidak bisa disimpan")
      downloaded++
    }

    // Files that are no longer in the APK part (changed, or a page that no longer fits)
    var removed = 0
    out.walkBottomUp().filter { it.isFile && it.name != "manifest.json" }.forEach {
      if (it.relativeTo(out).invariantSeparatorsPath !in files) {
        it.delete()
        removed++
      }
    }

    // `partial`: the app always switches to the complete online list once it is online
    val keep = included.map { it["id"] }.toSet()
    val bundled = LinkedHashMap(manifest)
    bundled["partial"] = skipped.isNotEmpty()
    bundled["targets"] = targets.filter { it["id"] in keep }
    out.mkdirs()
    out.resolve("manifest.json").writeText(groovy.json.JsonOutput.prettyPrint(groovy.json.JsonOutput.toJson(bundled)))

    fun pages(list: List<Map<String, Any?>>) = list.joinToString(", ") { (it["bookPage"] ?: it["qrCode"]).toString() }
    val mb = { b: Long -> "%.1f".format(b / 1048576.0) }
    logger.lifecycle(
      "[konten] ${included.size} dari ${targets.size} stiker ikut di APK (batas ${budgetMb.get().toInt()} MB, ${mb(planned)} MB): " +
        "$downloaded file diunduh, $kept tetap, $removed dihapus."
    )
    if (included.isNotEmpty()) logger.lifecycle("[konten] Di APK (offline sejak instal): halaman ${pages(included)}")
    if (skipped.isNotEmpty()) logger.lifecycle("[konten] Diunduh aplikasi saat online: halaman ${pages(skipped)}")
  }
}

// Settings of the web app (web-app/.env, web-app/.env.local), e.g. the content server address
val webEnv: Map<String, String> = buildMap {
  for (name in listOf(".env", ".env.local")) {
    val f = rootProject.file("web-app/$name")
    if (!f.exists()) continue
    for (line in f.readLines()) {
      val m = Regex("""^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$""").find(line) ?: continue
      put(m.groupValues[1], m.groupValues[2].trim('"', '\''))
    }
  }
  putAll(System.getenv().filterKeys { it.startsWith("VITE_") || it == "CONTENT_BUNDLE_MB" })
}

val bundleContent = tasks.register<BundleContentTask>("bundleContent") {
  val custom = webEnv["VITE_CONTENT_URL"].orEmpty().trim()
  val api = webEnv["VITE_CONTENT_API"].orEmpty().trim().trimEnd('/')
  baseUrl.set(
    when {
      custom.isNotEmpty() -> custom.trimEnd('/') + "/"
      api.isNotEmpty() -> "$api/cdn/"
      else -> ""
    }
  )
  budgetMb.set(webEnv["CONTENT_BUNDLE_MB"]?.toDoubleOrNull() ?: 120.0)
  webContentDir.set(layout.projectDirectory.dir("src/main/assets/www/content"))
  // Kept between builds: unchanged files are not downloaded again
  outputDir.set(layout.buildDirectory.dir("generated/vvContent"))
}

// Release builds (the AAB for the Play Store) only: test runs from the editor stay quick
androidComponents {
  onVariants(selector().withBuildType("release")) { variant ->
    variant.sources.assets?.addGeneratedSourceDirectory(bundleContent, BundleContentTask::outputDir)
  }
}
