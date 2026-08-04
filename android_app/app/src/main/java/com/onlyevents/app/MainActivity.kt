package com.onlyevents.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import com.onlyevents.app.screens.MainScreen
import com.onlyevents.app.ui.theme.OnlyEventsTheme
import com.onlyevents.app.viewmodel.OnlyEventsViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: OnlyEventsViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            OnlyEventsTheme {
                MainScreen(viewModel = viewModel)
            }
        }
    }
}
