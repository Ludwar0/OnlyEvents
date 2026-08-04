package com.onlyevents.app.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.onlyevents.app.models.EventCategory
import com.onlyevents.app.ui.theme.GoldPrimary
import com.onlyevents.app.viewmodel.OnlyEventsViewModel

@Composable
fun HomeScreen(viewModel: OnlyEventsViewModel) {
    val categories = listOf(
        EventCategory("Wedding", "💒", "Ceremony & reception"),
        EventCategory("Ruracio", "🤝", "Traditional dowry"),
        EventCategory("Memorial", "🕊️", "Farewell service"),
        EventCategory("Corporate", "💼", "Conferences & summits"),
        EventCategory("Birthday", "🎂", "Parties for all ages"),
        EventCategory("Graduation", "🎓", "Academic milestones"),
        EventCategory("Baby Shower", "🍼", "Welcome the new arrival"),
        EventCategory("Other", "✨", "Custom celebrations")
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // Hero Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1C1A24)),
            shape = RoundedCornerShape(20.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Surface(
                    color = GoldPrimary.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "🌟 Kenya's Premier Event Platform",
                        color = GoldPrimary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }

                Text(
                    text = "Every Celebration\nDeserves Perfection",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Text(
                    text = "Gold, Silver & Bronze tailored packages across Kenya.",
                    fontSize = 13.sp,
                    color = Color.Gray
                )

                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Button(
                        onClick = { viewModel.selectTab(1) },
                        colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary)
                    ) {
                        Text("Book Event", color = Color.Black, fontWeight = FontWeight.Bold)
                    }

                    OutlinedButton(onClick = { viewModel.selectTab(3) }) {
                        Text("Providers", color = Color.White)
                    }
                }
            }
        }

        // Stats Counters
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            StatItem("500+", "Events Managed", Modifier.weight(1f))
            StatItem("120+", "Providers", Modifier.weight(1f))
            StatItem("98%", "Satisfaction", Modifier.weight(1f))
        }

        // Event Categories
        Text(
            text = "EVENT CATEGORIES",
            color = GoldPrimary,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold
        )

        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            categories.chunked(2).forEach { rowCategories ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    rowCategories.forEach { cat ->
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .clickable {
                                    viewModel.formEventType = cat.name
                                    viewModel.selectTab(1)
                                },
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF1C1C22)),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(cat.icon, fontSize = 24.sp)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(cat.name, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                                Text(cat.description, color = Color.Gray, fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StatItem(number: String, label: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1C1C22)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(number, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = GoldPrimary)
            Text(label, fontSize = 10.sp, color = Color.Gray)
        }
    }
}
