package com.example

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Environment
import android.print.PrintAttributes
import android.print.PrintManager
import android.provider.MediaStore
import android.content.ContentValues
import android.graphics.Bitmap
import java.io.OutputStream
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Base64
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.webkit.WebViewAssetLoader
import com.example.ui.theme.EmeraldPrimary
import com.example.ui.theme.MyApplicationTheme
import java.io.File

/**
 * Native Storage Bridge for optimal, secure, permanent offline storage of
 * 3D .GLB models and audio files in app-private sandboxed internal storage (context.filesDir).
 *
 * Benefits:
 * - Requires ZERO dangerous storage permissions (compliant with modern Scoped Storage & Google Play policies)
 * - Permanent: Never wiped by browser cache limits or Android low-memory garbage collection
 * - High-speed direct streaming to Three.js GLTFLoader via WebViewAssetLoader InternalStoragePathHandler
 */
/**
 * Phone orientation from Android's fused rotation sensor (gyroscope + accelerometer, no magnetometer
 * drift). WebView's own `devicemotion` is missing or unreliable on many phones; this gives the AR view
 * an accurate rotation with known axes (x right, y up, z out of the screen), polled every frame.
 */
object RotationSensor : SensorEventListener {
  @Volatile private var latest: String = ""
  private var manager: SensorManager? = null
  private val q = FloatArray(4)

  fun start(context: Context) {
    val sm = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager ?: return
    val sensor = sm.getDefaultSensor(Sensor.TYPE_GAME_ROTATION_VECTOR)
      ?: sm.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
      ?: return
    manager = sm
    sm.registerListener(this, sensor, SensorManager.SENSOR_DELAY_GAME)
  }

  fun stop() {
    manager?.unregisterListener(this)
    manager = null
    latest = ""
  }

  /** "w,x,y,z" of the device orientation, or "" when there is no rotation sensor. */
  fun read(): String = latest

  override fun onSensorChanged(event: SensorEvent) {
    SensorManager.getQuaternionFromVector(q, event.values)
    latest = "${q[0]},${q[1]},${q[2]},${q[3]}"
  }

  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}

class NativeStorageBridge(
  private val context: Context,
  private val webViewProvider: () -> WebView?
) {
  private val mainHandler = android.os.Handler(android.os.Looper.getMainLooper())
  private var downloadStream: OutputStream? = null
  private var downloadLocation: String = ""

  private val modelsDir = File(context.filesDir, "ar_models").apply { mkdirs() }
  private val audioDir = File(context.filesDir, "ar_audio").apply { mkdirs() }

  @JavascriptInterface
  fun isNativeApp(): Boolean = true

  @JavascriptInterface
  fun saveModelBase64(targetId: String, base64Data: String): String {
    return try {
      val cleanData = if (base64Data.contains(",")) base64Data.substringAfter(",") else base64Data
      val bytes = Base64.decode(cleanData, Base64.DEFAULT)
      val file = File(modelsDir, "$targetId.glb")
      file.writeBytes(bytes)
      "https://appassets.androidplatform.net/models/$targetId.glb"
    } catch (e: Exception) {
      e.printStackTrace()
      ""
    }
  }

  @JavascriptInterface
  fun saveAudioBase64(targetId: String, base64Data: String): String {
    return try {
      val cleanData = if (base64Data.contains(",")) base64Data.substringAfter(",") else base64Data
      val bytes = Base64.decode(cleanData, Base64.DEFAULT)
      val file = File(audioDir, "$targetId.mp3")
      file.writeBytes(bytes)
      "https://appassets.androidplatform.net/audio/$targetId.mp3"
    } catch (e: Exception) {
      e.printStackTrace()
      ""
    }
  }

  @JavascriptInterface
  fun getModelUrl(targetId: String): String {
    val file = File(modelsDir, "$targetId.glb")
    return if (file.exists()) "https://appassets.androidplatform.net/models/$targetId.glb" else ""
  }

  @JavascriptInterface
  fun getAudioUrl(targetId: String): String {
    val file = File(audioDir, "$targetId.mp3")
    return if (file.exists()) "https://appassets.androidplatform.net/audio/$targetId.mp3" else ""
  }

  @JavascriptInterface
  fun deleteTargetFiles(targetId: String) {
    try {
      File(modelsDir, "$targetId.glb").delete()
      File(audioDir, "$targetId.mp3").delete()
    } catch (e: Exception) {
      e.printStackTrace()
    }
  }

  /** Opens the Android print dialog for the current page (printer or "Save as PDF"). */
  @JavascriptInterface
  fun printPage() {
    mainHandler.post {
      val webView = webViewProvider() ?: return@post
      val printManager = context.getSystemService(Context.PRINT_SERVICE) as? PrintManager ?: return@post
      val adapter = webView.createPrintDocumentAdapter("Stiker QR Vinu Veti")
      printManager.print(
        "Stiker QR Vinu Veti",
        adapter,
        PrintAttributes.Builder().setMediaSize(PrintAttributes.MediaSize.ISO_A4).build()
      )
    }
  }

  /** Chunked file save into the public Downloads folder (QR images, content pack ZIP). */
  @JavascriptInterface
  fun beginDownload(fileName: String, mimeType: String): Boolean {
    return try {
      downloadStream?.close()
      val safeName = fileName.replace(Regex("[^A-Za-z0-9._-]"), "_")
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        val values = ContentValues().apply {
          put(MediaStore.Downloads.DISPLAY_NAME, safeName)
          put(MediaStore.Downloads.MIME_TYPE, mimeType)
          put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/VinuVeti")
        }
        val uri = context.contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
          ?: return false
        downloadStream = context.contentResolver.openOutputStream(uri)
        downloadLocation = "Download/VinuVeti/$safeName"
      } else {
        val dir = (context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS) ?: context.filesDir).apply { mkdirs() }
        val file = File(dir, safeName)
        downloadStream = file.outputStream()
        downloadLocation = file.absolutePath
      }
      downloadStream != null
    } catch (e: Exception) {
      e.printStackTrace()
      downloadStream = null
      false
    }
  }

  @JavascriptInterface
  fun appendDownloadChunk(base64Data: String): Boolean {
    return try {
      val stream = downloadStream ?: return false
      stream.write(Base64.decode(base64Data, Base64.DEFAULT))
      true
    } catch (e: Exception) {
      e.printStackTrace()
      false
    }
  }

  @JavascriptInterface
  fun finishDownload(): String {
    return try {
      downloadStream?.flush()
      downloadStream?.close()
      downloadStream = null
      downloadLocation
    } catch (e: Exception) {
      e.printStackTrace()
      downloadStream = null
      ""
    }
  }

  /** Device orientation quaternion "w,x,y,z" from the rotation sensor ("" if unavailable). */
  @JavascriptInterface
  fun getRotationQuat(): String = RotationSensor.read()

  @JavascriptInterface
  fun vibrate(durationMs: Long) {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
        vibratorManager?.defaultVibrator?.vibrate(
          VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE)
        )
      } else {
        @Suppress("DEPRECATION")
        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          vibrator?.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
          @Suppress("DEPRECATION")
          vibrator?.vibrate(durationMs)
        }
      }
    } catch (e: Exception) {
      // ignore
    }
  }
}

class MainActivity : ComponentActivity() {

  private var fileUploadCallback: ValueCallback<Array<Uri>>? = null

  private val fileChooserLauncher =
    registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
      if (result.resultCode == Activity.RESULT_OK) {
        val intentData = result.data
        val uris = when {
          intentData?.clipData != null -> {
            val count = intentData.clipData!!.itemCount
            Array(count) { i -> intentData.clipData!!.getItemAt(i).uri }
          }
          intentData?.data != null -> arrayOf(intentData.data!!)
          else -> null
        }
        fileUploadCallback?.onReceiveValue(uris)
      } else {
        fileUploadCallback?.onReceiveValue(null)
      }
      fileUploadCallback = null
    }

  override fun onResume() {
    super.onResume()
    RotationSensor.start(this)
  }

  override fun onPause() {
    RotationSensor.stop()
    super.onPause()
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    // Light app background: always use dark status/navigation bar icons
    enableEdgeToEdge(
      statusBarStyle = SystemBarStyle.light(android.graphics.Color.TRANSPARENT, android.graphics.Color.TRANSPARENT),
      navigationBarStyle = SystemBarStyle.light(android.graphics.Color.TRANSPARENT, android.graphics.Color.TRANSPARENT)
    )

    setContent {
      MyApplicationTheme {
        ARBookScreen(
          onOpenFileChooser = { callback, intent ->
            fileUploadCallback?.onReceiveValue(null)
            fileUploadCallback = callback
            fileChooserLauncher.launch(intent)
          }
        )
      }
    }
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun ARBookScreen(
  onOpenFileChooser: (ValueCallback<Array<Uri>>, Intent) -> Unit,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current
  var hasCameraPermission by remember {
    mutableStateOf(
      ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) ==
          PackageManager.PERMISSION_GRANTED
    )
  }

  var isWebViewLoading by remember { mutableStateOf(true) }
  var webViewRef by remember { mutableStateOf<WebView?>(null) }
  var pendingPermissionRequest by remember { mutableStateOf<PermissionRequest?>(null) }

  val cameraPermissionLauncher =
    rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
      hasCameraPermission = isGranted
      if (isGranted) {
        pendingPermissionRequest?.let { req ->
          req.grant(req.resources.filter { it == PermissionRequest.RESOURCE_VIDEO_CAPTURE }.toTypedArray())
        }
        pendingPermissionRequest = null
      } else {
        pendingPermissionRequest?.deny()
        pendingPermissionRequest = null
      }
    }

  LaunchedEffect(Unit) {
    if (!hasCameraPermission) {
      cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
    }
  }

  BackHandler(enabled = true) {
    if (webViewRef?.canGoBack() == true) {
      webViewRef?.goBack()
    } else {
      (context as? Activity)?.finish()
    }
  }

  Scaffold(
    modifier = modifier.fillMaxSize(),
    contentWindowInsets = WindowInsets.safeDrawing,
    containerColor = Color(0xFFCFEFFB)
  ) { innerPadding ->
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
    ) {
      // Modern Android WebView wrapped in AndroidView
      AndroidView(
        modifier = Modifier
          .fillMaxSize()
          .testTag("ar_webview"),
        factory = { ctx ->
          WebView(ctx).apply {
            layoutParams = ViewGroup.LayoutParams(
              ViewGroup.LayoutParams.MATCH_PARENT,
              ViewGroup.LayoutParams.MATCH_PARENT
            )

            setBackgroundColor(android.graphics.Color.parseColor("#CFEFFB"))
            setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null)

            val modelsDir = File(ctx.filesDir, "ar_models").apply { mkdirs() }
            val audioDir = File(ctx.filesDir, "ar_audio").apply { mkdirs() }

            // Setup WebViewAssetLoader to serve internal assets, models, and audio via secure https:// domain
            val assetLoader = WebViewAssetLoader.Builder()
              .setDomain("appassets.androidplatform.net")
              .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(ctx))
              .addPathHandler("/models/", WebViewAssetLoader.InternalStoragePathHandler(ctx, modelsDir))
              .addPathHandler("/audio/", WebViewAssetLoader.InternalStoragePathHandler(ctx, audioDir))
              .build()

            settings.apply {
              javaScriptEnabled = true
              domStorageEnabled = true
              allowFileAccess = true
              allowContentAccess = true
              mediaPlaybackRequiresUserGesture = false
              loadWithOverviewMode = true
              useWideViewPort = true
              cacheMode = WebSettings.LOAD_DEFAULT
              mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            }

            // Expose Native Android Bridge to JavaScript
            val self = this
            addJavascriptInterface(NativeStorageBridge(ctx) { self }, "AndroidBridge")

            webChromeClient = object : WebChromeClient() {
              // Without this, a <video> without frames shows WebView's grey "play" poster
              override fun getDefaultVideoPoster(): Bitmap =
                Bitmap.createBitmap(1, 1, Bitmap.Config.ARGB_8888)

              override fun onPermissionRequest(request: PermissionRequest) {
                android.os.Handler(android.os.Looper.getMainLooper()).post {
                  val resourcesToGrant = mutableListOf<String>()
                  for (res in request.resources) {
                    if (res == PermissionRequest.RESOURCE_VIDEO_CAPTURE) {
                      if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                        resourcesToGrant.add(res)
                      }
                    }
                  }
                  if (resourcesToGrant.isNotEmpty()) {
                    request.grant(resourcesToGrant.toTypedArray())
                  } else if (request.resources.contains(PermissionRequest.RESOURCE_VIDEO_CAPTURE)) {
                    pendingPermissionRequest?.deny()
                    pendingPermissionRequest = request
                    cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                  } else {
                    request.deny()
                  }
                }
              }

              override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
              ): Boolean {
                if (filePathCallback == null) return false
                val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                  type = "*/*"
                  addCategory(Intent.CATEGORY_OPENABLE)
                  putExtra(
                    Intent.EXTRA_MIME_TYPES,
                    arrayOf(
                      "model/gltf-binary",
                      "model/gltf+json",
                      "application/octet-stream",
                      "application/json",
                      "audio/*",
                      "*/*"
                    )
                  )
                }
                onOpenFileChooser(filePathCallback, intent)
                return true
              }

              override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                return super.onConsoleMessage(consoleMessage)
              }
            }

            webViewClient = object : WebViewClient() {
              override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
              ): WebResourceResponse? {
                if (request != null) {
                  val response = assetLoader.shouldInterceptRequest(request.url)
                  if (response != null) {
                    return response
                  }
                }
                return super.shouldInterceptRequest(view, request)
              }

              override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                isWebViewLoading = false
              }
            }

            // Load the web app index.html
            loadUrl("https://appassets.androidplatform.net/assets/www/index.html")
            webViewRef = this
          }
        },
        update = { webView ->
          webViewRef = webView
        }
      )

      // Fallback banner if Camera Permission was denied by user
      AnimatedVisibility(
        visible = !hasCameraPermission,
        enter = fadeIn(),
        exit = fadeOut(),
        modifier = Modifier.align(Alignment.BottomCenter)
      ) {
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
            .clip(RoundedCornerShape(20.dp))
            .background(Color(0xE60F172A))
            .padding(20.dp)
        ) {
          Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
          ) {
            Box(
              modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
                .background(Color(0x33F59E0B)),
              contentAlignment = Alignment.Center
            ) {
              Icon(
                imageVector = Icons.Default.CameraAlt,
                contentDescription = "Camera Permission",
                tint = Color(0xFFF59E0B),
                modifier = Modifier.size(24.dp)
              )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
              text = "Izin Kamera Diperlukan",
              style = MaterialTheme.typography.titleMedium.copy(
                fontWeight = FontWeight.Bold,
                color = Color.White
              ),
              textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
              text = "Aplikasi memerlukan izin kamera untuk memindai stiker QR pada buku dan menampilkan objek 3D di dunia nyata.",
              style = MaterialTheme.typography.bodySmall.copy(
                color = Color(0xFF94A3B8)
              ),
              textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(16.dp))
            Button(
              onClick = { cameraPermissionLauncher.launch(Manifest.permission.CAMERA) },
              colors = ButtonDefaults.buttonColors(
                containerColor = EmeraldPrimary,
                contentColor = Color.Black
              ),
              shape = RoundedCornerShape(12.dp),
              modifier = Modifier
                .fillMaxWidth()
                .testTag("grant_camera_button")
            ) {
              Icon(
                imageVector = Icons.Default.CameraAlt,
                contentDescription = null,
                modifier = Modifier.size(18.dp)
              )
              Spacer(modifier = Modifier.size(8.dp))
              Text(
                text = "Aktifkan Kamera AR",
                fontWeight = FontWeight.SemiBold
              )
            }
          }
        }
      }

      // Initial loading spinner while web assets initialize
      AnimatedVisibility(
        visible = isWebViewLoading,
        enter = fadeIn(),
        exit = fadeOut(),
        modifier = Modifier.align(Alignment.Center)
      ) {
        Column(
          horizontalAlignment = Alignment.CenterHorizontally,
          modifier = Modifier.padding(16.dp)
        ) {
          CircularProgressIndicator(
            color = Color(0xFF1BA7A0),
            modifier = Modifier
              .size(42.dp)
              .testTag("app_loading_indicator")
          )
          Spacer(modifier = Modifier.height(12.dp))
          Text(
            text = "Memuat Vinu Veti...",
            style = MaterialTheme.typography.bodySmall.copy(
              color = Color(0xFF173A6B)
            )
          )
        }
      }
    }
  }

  DisposableEffect(Unit) {
    onDispose {
      webViewRef?.destroy()
    }
  }
}
