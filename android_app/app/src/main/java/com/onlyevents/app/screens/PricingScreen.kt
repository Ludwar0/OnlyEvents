package com.onlyevents.app.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.onlyevents.app.ui.theme.GoldPrimary
import com.onlyevents.app.viewmodel.OnlyEventsViewModel

@Composable
fun PricingScreen(viewModel: OnlyEventsViewModel) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Rate Card", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White)
        Text("Transparent pricing across three tiers.", fontSize = 13.sp, color = Color.Gray)

        // Bronze
        PackageCardItem("Bronze Package", "KES 50,000", "Up to 100 guests", Color(0xFFCD7F32)) {
            viewModel.formPackage = "Bronze"
            viewModel.selectTab(1)
        }

        // Silver
        PackageCardItem("Silver Package", "KES 120,000", "Up to 300 guests (POPULAR)", Color(0xFFC0C0C0)) {
            viewModel.formPackage = "Silver"
            viewModel.selectTab(1)
        }

        // Gold
        PackageCardItem("Gold Package", "KES 280,000", "Up to 1000 guests (PREMIUM)", GoldPrimary) {
            viewModel.formPackage = "Gold"
            viewModel.selectTab(1)
        }
    }
}

@Composable
fun PackageCardItem(title: String, price: String, capacity: String, color: Color, onBook: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1C1C22)),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Text(title, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = color)
            Text(capacity, fontSize = 12.sp, color = Color.Gray)
            Spacer(modifier = Modifier.height(8.dp))
            Text(price, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Spacer(modifier = Modifier.height(12.dp))
            Button(
                onClick = onBook,
                colors = ButtonDefaults.buttonColors(containerColor = color),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Book $title", color = Color.Black, fontWeight = FontWeight.Bold)
            }
        }
    }
}
