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
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
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
class NativeStorageBridge(private val context: Context) {
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

  companion object {
    init {
      try {
        android.system.Os.setenv("LIBGL_ALWAYS_SOFTWARE", "1", true)
      } catch (_: Throwable) {
      }
    }
  }

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

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

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
        pendingPermissionRequest?.grant(pendingPermissionRequest?.resources)
        pendingPermissionRequest = null
        webViewRef?.reload()
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

  Surface(
    modifier = modifier.fillMaxSize(),
    color = Color.Black
  ) {
    Box(modifier = Modifier.fillMaxSize()) {
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

            setBackgroundColor(android.graphics.Color.BLACK)
            setLayerType(android.view.View.LAYER_TYPE_NONE, null)

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
              databaseEnabled = true
              allowFileAccess = true
              allowContentAccess = true
              mediaPlaybackRequiresUserGesture = false
              loadWithOverviewMode = true
              useWideViewPort = true
              cacheMode = WebSettings.LOAD_DEFAULT
              mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            }

            // Expose Native Android Bridge to JavaScript
            addJavascriptInterface(NativeStorageBridge(ctx), "AndroidBridge")

            webChromeClient = object : WebChromeClient() {
              override fun onPermissionRequest(request: PermissionRequest) {
                if (ContextCompat.checkSelfPermission(ctx, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                  request.grant(request.resources)
                } else {
                  pendingPermissionRequest = request
                  cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                }
              }

              override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
              ): Boolean {
                if (filePathCallback == null) return false
                val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                  type = "*/*"
                  addCategory(Intent.CATEGORY_OPENABLE)
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
            color = EmeraldPrimary,
            modifier = Modifier
              .size(42.dp)
              .testTag("app_loading_indicator")
          )
          Spacer(modifier = Modifier.height(12.dp))
          Text(
            text = "Memuat AR Book Explorer...",
            style = MaterialTheme.typography.bodySmall.copy(
              color = Color(0xFF94A3B8)
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
