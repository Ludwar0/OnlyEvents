package com.onlyevents.app.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
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
fun ChatScreen(viewModel: OnlyEventsViewModel) {
    val activeChat = viewModel.activeChat.collectAsState().value
    val chatSessions = viewModel.chatSessions.collectAsState().value
    
    if (activeChat == null) {
        // Chat List View
        Column(
            modifier = Modifier.fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text("Messages", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White)
            
            if (chatSessions.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No active conversations", color = Color.Gray)
                }
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(chatSessions) { session ->
                        Card(
                            modifier = Modifier.fillMaxWidth().height(80.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF1C1C22)),
                            onClick = { viewModel.openChat(viewModel.providers.value.first { it.id == session.providerId }) }
                        ) {
                            Row(
                                modifier = Modifier.padding(16.dp).fillMaxSize(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Surface(
                                    modifier = Modifier.size(40.dp),
                                    color = GoldPrimary,
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(session.providerName.take(1), fontWeight = FontWeight.Bold)
                                    }
                                }
                                Column {
                                    Text(session.providerName, fontWeight = FontWeight.Bold, color = Color.White)
                                    Text(session.lastMessage, color = Color.Gray, fontSize = 12.sp, maxLines = 1)
                                }
                            }
                        }
                    }
                }
            }
        }
    } else {
        // Active Chat View
        Column(modifier = Modifier.fillMaxSize().background(Color(0xFF0F0F12))) {
            // Header
            TopAppBar(
                title = { Text(activeChat.providerName, color = Color.White) },
                navigationIcon = {
                    TextButton(onClick = { viewModel.selectProvider(null); viewModel.selectTab(5) /* Back to list */ }) {
                        Text("Back", color = GoldPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF1C1C22))
            )

            // Messages
            LazyColumn(
                modifier = Modifier.weight(1f).padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(vertical = 16.dp)
            ) {
                items(activeChat.messages) { msg ->
                    val alignment = if (msg.isFromUser) Alignment.End else Alignment.Start
                    val color = if (msg.isFromUser) GoldPrimary else Color(0xFF1C1C22)
                    val textColor = if (msg.isFromUser) Color.Black else Color.White

                    Column(modifier = Modifier.fillMaxWidth(), horizontalAlignment = alignment) {
                        Surface(
                            color = color,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.widthIn(max = 280.dp)
                        ) {
                            Text(
                                text = msg.text,
                                modifier = Modifier.padding(12.dp),
                                color = textColor,
                                fontSize = 14.sp
                            )
                        }
                        Text(msg.timestamp, fontSize = 10.sp, color = Color.Gray, modifier = Modifier.padding(top = 2.dp))
                    }
                }
            }

            // Input
            var text by remember { mutableStateOf("") }
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TextField(
                    value = text,
                    onValueChange = { text = it },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("Type a message...") },
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color(0xFF1C1C22),
                        unfocusedContainerColor = Color(0xFF1C1C22),
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent
                    ),
                    shape = RoundedCornerShape(20.dp)
                )
                FloatingActionButton(
                    onClick = {
                        viewModel.sendMessage(text)
                        text = ""
                    },
                    containerColor = GoldPrimary,
                    modifier = Modifier.size(48.dp)
                ) {
                    Icon(Icons.Default.Send, contentDescription = "Send", tint = Color.Black)
                }
            }
        }
    }
}
