package com.onlyevents.app.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.onlyevents.app.ui.theme.GoldPrimary
import com.onlyevents.app.viewmodel.OnlyEventsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PaymentDialog(viewModel: OnlyEventsViewModel) {
    var method by remember { mutableStateOf("M-Pesa") }

    AlertDialog(
        onDismissRequest = { viewModel.dismissPaymentDialog() },
        title = { Text("Confirm 30% Deposit", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Select your preferred payment method:", fontSize = 12.sp, color = Color.Gray)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    FilterChip(
                        selected = method == "M-Pesa",
                        onClick = { method = "M-Pesa" },
                        label = { Text("M-Pesa") }
                    )
                    FilterChip(
                        selected = method == "Visa",
                        onClick = { method = "Visa" },
                        label = { Text("Visa") }
                    )
                    FilterChip(
                        selected = method == "PayPal",
                        onClick = { method = "PayPal" },
                        label = { Text("PayPal") }
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { viewModel.confirmPayment(method) },
                colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary)
            ) {
                Text("Pay Deposit Now", color = Color.Black, fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = { viewModel.dismissPaymentDialog() }) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun ReceiptDialog(viewModel: OnlyEventsViewModel) {
    val rec = viewModel.lastPaymentRecord

    AlertDialog(
        onDismissRequest = { viewModel.dismissReceiptDialog() },
        title = { Text("Official Receipt 🧾", color = GoldPrimary, fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                if (rec != null) {
                    Text("Receipt #: ${rec.id}", fontWeight = FontWeight.Bold)
                    Text("Client: ${rec.clientName}")
                    Text("Package: ${rec.packageName}")
                    Text("Method: ${rec.method}")
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Amount Paid: KES ${rec.amount}", color = Color.Green, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { viewModel.openLiveTracker() },
                colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary)
            ) {
                Text("Track Delivery 📍", color = Color.Black, fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = { viewModel.dismissReceiptDialog() }) {
                Text("Close")
            }
        }
    )
}

@Composable
fun LiveTrackerDialog(viewModel: OnlyEventsViewModel) {
    AlertDialog(
        onDismissRequest = { viewModel.dismissLiveTracker() },
        title = { Text("📍 Live Delivery Tracker", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Surface(
                    color = Color(0xFF121216),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text("Nairobi GPS Route Active\nDriver ETA: 24 Mins", color = GoldPrimary, fontWeight = FontWeight.Bold)
                    }
                }
                Text("Assigned Driver: Peter Mwangi (Truck KDA 001X)", fontSize = 12.sp, color = Color.White)
            }
        },
        confirmButton = {
            TextButton(onClick = { viewModel.dismissLiveTracker() }) {
                Text("Close Tracker")
            }
        }
    )
}
