package com.onlyevents.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import com.onlyevents.app.screens.MainScreen
import com.onlyevents.app.ui.theme.OnlyEventsTheme
import com.onlyevents.app.viewmodel.OnlyEventsViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: OnlyEventsViewModel by viewModels()

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            viewModel.updateLocation("Nairobi, Kenya (GPS)")
            viewModel.showToast("Location Access Granted")
        } else {
            viewModel.showToast("Location Access Denied")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            OnlyEventsTheme {
                MainScreen(viewModel = viewModel)
            }
        }
    }

    fun requestLocationPermission() {
        requestPermissionLauncher.launch(android.Manifest.permission.ACCESS_COARSE_LOCATION)
    }
}
