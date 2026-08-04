package com.onlyevents.app.screens

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.onlyevents.app.ui.theme.GoldPrimary
import com.onlyevents.app.viewmodel.OnlyEventsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(viewModel: OnlyEventsViewModel) {
    val selectedTab = viewModel.selectedTab.collectAsState().value
    val showPayment = viewModel.showPaymentDialog.collectAsState().value
    val showReceipt = viewModel.showReceiptDialog.collectAsState().value
    val showTracker = viewModel.showLiveTracker.collectAsState().value
    val toast = viewModel.toastMessage.collectAsState().value

    val snackbarHostState = androidx.compose.runtime.remember { SnackbarHostState() }

    androidx.compose.runtime.LaunchedEffect(toast) {
        toast?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearToast()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Only Events", color = GoldPrimary) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF0F0F12))
            )
        },
        bottomBar = {
            NavigationBar(containerColor = Color(0xFF1C1C22)) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { viewModel.selectTab(0) },
                    icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                    label = { Text("Home") },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = GoldPrimary, selectedTextColor = GoldPrimary)
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { viewModel.selectTab(1) },
                    icon = { Icon(Icons.Default.DateRange, contentDescription = "Book") },
                    label = { Text("Book") },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = GoldPrimary, selectedTextColor = GoldPrimary)
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { viewModel.selectTab(2) },
                    icon = { Icon(Icons.Default.Sell, contentDescription = "Pricing") },
                    label = { Text("Rate Card") },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = GoldPrimary, selectedTextColor = GoldPrimary)
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { viewModel.selectTab(3) },
                    icon = { Icon(Icons.Default.Storefront, contentDescription = "Providers") },
                    label = { Text("Providers") },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = GoldPrimary, selectedTextColor = GoldPrimary)
                )
                NavigationBarItem(
                    selected = selectedTab == 4,
                    onClick = { viewModel.selectTab(4) },
                    icon = { Icon(Icons.Default.Settings, contentDescription = "Admin") },
                    label = { Text("Admin") },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = GoldPrimary, selectedTextColor = GoldPrimary)
                )
            }
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { innerPadding ->
        Surface(
            modifier = Modifier.padding(innerPadding),
            color = Color(0xFF0F0F12)
        ) {
            when (selectedTab) {
                0 -> HomeScreen(viewModel)
                1 -> BookingScreen(viewModel)
                2 -> PricingScreen(viewModel)
                3 -> MarketplaceScreen(viewModel)
                4 -> AdminScreen(viewModel)
            }
        }
    }

    if (showPayment) PaymentDialog(viewModel)
    if (showReceipt) ReceiptDialog(viewModel)
    if (showTracker) LiveTrackerDialog(viewModel)
}
