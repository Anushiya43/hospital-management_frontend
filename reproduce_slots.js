
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function generateSlots(startTime, endTime, slotDuration) {
    let currentTime = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const slots = [];

    console.log(`Generating slots: ${startTime} to ${endTime}, Duration: ${slotDuration}`);

    while (currentTime + slotDuration <= endMinutes) {
        const start = minutesToTime(currentTime);
        const end = minutesToTime(currentTime + slotDuration);
        slots.push(`${start} - ${end}`);
        currentTime += slotDuration;
    }
    return slots;
}

// Test Case 1: Perfect fit
console.log('Test 1:', generateSlots('09:00', '12:00', 60));

// Test Case 2: Truncated end
console.log('Test 2:', generateSlots('09:00', '12:15', 60));

// Test Case 3: Small duration
console.log('Test 3:', generateSlots('09:00', '10:00', 15));

// Test Case 4: End time exactly one slot
console.log('Test 4:', generateSlots('09:00', '09:30', 30));

// Test Case 6: Partial slot (09:00-09:50, 30 min)
console.log('Test 6:', generateSlots('09:00', '09:50', 30));
