package com.onlyevents.app.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Schedule
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
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookingScreen(viewModel: OnlyEventsViewModel) {
    var name by remember { mutableStateOf(viewModel.formName) }
    var phone by remember { mutableStateOf(viewModel.formPhone) }
    var email by remember { mutableStateOf(viewModel.formEmail) }
    var eventType by remember { mutableStateOf(viewModel.formEventType) }
    var selectedPackage by remember { mutableStateOf(viewModel.formPackage) }
    var guests by remember { mutableStateOf(viewModel.formGuests) }
    var venue by remember { mutableStateOf(viewModel.formVenue) }
    var eventDate by remember { mutableStateOf(viewModel.formDate) }
    var eventTime by remember { mutableStateOf(viewModel.formTime) }

    var showDatePicker by remember { mutableStateOf(false) }
    var showTimePicker by remember { mutableStateOf(false) }

    val datePickerState = rememberDatePickerState()
    val timePickerState = rememberTimePickerState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Book an Event", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White)
        Text("Customize your celebration details.", fontSize = 13.sp, color = Color.Gray)

        OutlinedTextField(
            value = name,
            onValueChange = { name = it; viewModel.formName = it },
            label = { Text("Full Name") },
            modifier = Modifier.fillMaxWidth()
        )

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            OutlinedTextField(
                value = phone,
                onValueChange = { phone = it; viewModel.formPhone = it },
                label = { Text("Phone") },
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = guests,
                onValueChange = { guests = it; viewModel.formGuests = it },
                label = { Text("Guests") },
                modifier = Modifier.weight(0.6f)
            )
        }

        // Dropdown for Event Type
        var eventTypeExpanded by remember { mutableStateOf(false) }
        ExposedDropdownMenuBox(
            expanded = eventTypeExpanded,
            onExpandedChange = { eventTypeExpanded = !eventTypeExpanded }
        ) {
            OutlinedTextField(
                value = eventType,
                onValueChange = {},
                readOnly = true,
                label = { Text("Event Type") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = eventTypeExpanded) },
                modifier = Modifier.menuAnchor().fillMaxWidth()
            )
            ExposedDropdownMenu(
                expanded = eventTypeExpanded,
                onDismissRequest = { eventTypeExpanded = false }
            ) {
                viewModel.eventTypes.forEach { type ->
                    DropdownMenuItem(
                        text = { Text(type) },
                        onClick = {
                            eventType = type
                            viewModel.formEventType = type
                            eventTypeExpanded = false
                        }
                    )
                }
            }
        }

        // Dropdown for Package
        var packageExpanded by remember { mutableStateOf(false) }
        ExposedDropdownMenuBox(
            expanded = packageExpanded,
            onExpandedChange = { packageExpanded = !packageExpanded }
        ) {
            OutlinedTextField(
                value = selectedPackage,
                onValueChange = {},
                readOnly = true,
                label = { Text("Service Package") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = packageExpanded) },
                modifier = Modifier.menuAnchor().fillMaxWidth()
            )
            ExposedDropdownMenu(
                expanded = packageExpanded,
                onDismissRequest = { packageExpanded = false }
            ) {
                viewModel.packageTiers.forEach { tier ->
                    DropdownMenuItem(
                        text = { Text(tier) },
                        onClick = {
                            selectedPackage = tier
                            viewModel.formPackage = tier
                            packageExpanded = false
                        }
                    )
                }
            }
        }

        // Date and Time Pickers
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            OutlinedTextField(
                value = eventDate,
                onValueChange = {},
                readOnly = true,
                label = { Text("Date") },
                leadingIcon = {
                    Icon(
                        Icons.Default.CalendarMonth,
                        contentDescription = null,
                        modifier = Modifier.clickable { showDatePicker = true }
                    )
                },
                modifier = Modifier.weight(1f).clickable { showDatePicker = true }
            )
            OutlinedTextField(
                value = eventTime,
                onValueChange = {},
                readOnly = true,
                label = { Text("Time") },
                leadingIcon = {
                    Icon(
                        Icons.Default.Schedule,
                        contentDescription = null,
                        modifier = Modifier.clickable { showTimePicker = true }
                    )
                },
                modifier = Modifier.weight(1f).clickable { showTimePicker = true }
            )
        }

        // Venue Selection
        Text("Venue / Location", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
        OutlinedTextField(
            value = venue,
            onValueChange = { venue = it; viewModel.formVenue = it },
            placeholder = { Text("Enter venue name or area") },
            modifier = Modifier.fillMaxWidth()
        )

        Text("Recommended Venues:", fontSize = 12.sp, color = Color.Gray)
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(viewModel.recommendedVenues) { rec ->
                FilterChip(
                    selected = venue == rec,
                    onClick = { venue = rec; viewModel.formVenue = rec },
                    label = { Text(rec) }
                )
            }
        }

        Button(
            onClick = { viewModel.submitBooking() },
            colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary),
            modifier = Modifier.fillMaxWidth().height(56.dp).padding(top = 10.dp),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text("Complete Booking", color = Color.Black, fontWeight = FontWeight.Bold)
        }
    }

    if (showDatePicker) {
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    val date = datePickerState.selectedDateMillis?.let {
                        val cal = Calendar.getInstance().apply { timeInMillis = it }
                        "${cal.get(Calendar.DAY_OF_MONTH)}/${cal.get(Calendar.MONTH) + 1}/${cal.get(Calendar.YEAR)}"
                    } ?: eventDate
                    eventDate = date
                    viewModel.updateFormDate(date)
                    showDatePicker = false
                }) { Text("OK") }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) { Text("Cancel") }
            }
        ) {
            DatePicker(state = datePickerState)
        }
    }

    if (showTimePicker) {
        AlertDialog(
            onDismissRequest = { showTimePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    val time = "${timePickerState.hour}:${String.format("%02d", timePickerState.minute)}"
                    eventTime = time
                    viewModel.updateFormTime(time)
                    showTimePicker = false
                }) { Text("OK") }
            },
            dismissButton = {
                TextButton(onClick = { showTimePicker = false }) { Text("Cancel") }
            },
            text = {
                TimePicker(state = timePickerState)
            }
        )
    }
}
