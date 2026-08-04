package com.onlyevents.app.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.onlyevents.app.ui.theme.GoldPrimary
import com.onlyevents.app.viewmodel.OnlyEventsViewModel

@Composable
fun AdminScreen(viewModel: OnlyEventsViewModel) {
    val bookings = viewModel.bookings.collectAsState().value
    val trucks = viewModel.trucks.collectAsState().value

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("Admin & Logistics", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Text("Real-time operational dashboard.", fontSize = 13.sp, color = Color.Gray)
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Card(
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1C1C22))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text("Active Events", color = Color.Gray, fontSize = 11.sp)
                        Text("${bookings.size}", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0A84FF))
                    }
                }

                Card(
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1C1C22))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text("Fleet Active", color = Color.Gray, fontSize = 11.sp)
                        Text("${trucks.filter { it.status == "Deployed" }.size}/${trucks.size}", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color(0xFF30D158))
                    }
                }
            }
        }

        item {
            Button(
                onClick = { viewModel.openLiveTracker() },
                colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Open Live GPS Delivery Tracker 📍", color = Color.Black, fontWeight = FontWeight.Bold)
            }
        }

        item {
            Text("Active Bookings", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }

        items(bookings) { b ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1C1C22)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(b.clientName, fontWeight = FontWeight.Bold, color = Color.White)
                        Text(b.status, color = if (b.status == "Active") Color.Green else Color.Yellow, fontSize = 12.sp)
                    }
                    Text("${b.eventType} • ${b.packageName} Package", color = GoldPrimary, fontSize = 12.sp)
                    Text("Venue: ${b.venue} | Date: ${b.eventDate}", color = Color.Gray, fontSize = 11.sp)
                }
            }
        }
    }
}
