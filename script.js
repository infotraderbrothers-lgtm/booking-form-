// Get URL parameters for pre-filling
const urlParams = new URLSearchParams(window.location.search);
const clientName = urlParams.get('name');
const clientPhone = urlParams.get('phone');
const existingProjectInfo = urlParams.get('projectInfo');

// Pre-fill name and phone if provided
if (clientName) {
    document.getElementById('clientName').value = decodeURIComponent(clientName);
}
if (clientPhone) {
    document.getElementById('currentPhone').value = decodeURIComponent(clientPhone);
}
if (existingProjectInfo) {
    document.getElementById('existingProjectInfo').value = decodeURIComponent(existingProjectInfo);
}

// Form elements
const form = document.getElementById('bookingForm');
const submitBtn = document.getElementById('submitBtn');
const phoneInputSection = document.getElementById('phoneInputSection');
const phoneYes = document.getElementById('phoneYes');
const phoneNo = document.getElementById('phoneNo');
const phoneNumber = document.getElementById('phoneNumber');
const jobDetails = document.getElementById('jobDetails');
const timeSlots = document.querySelectorAll('.time-slot');
const selectedTimeInput = document.getElementById('selectedTime');
const selectedDateInput = document.getElementById('selectedDate');
const errorMessage = document.getElementById('errorMessage');

// Calendar elements
const calendarInput = document.getElementById('calendarInput');
const calendarDropdown = document.getElementById('calendarDropdown');
const monthYearDisplay = document.getElementById('monthYearDisplay');
const calendarDays = document.getElementById('calendarDays');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

let currentDate = new Date();
let selectedDateObj = null;
const today = new Date();
today.setHours(0, 0, 0, 0);
const maxDate = new Date();
maxDate.setMonth(maxDate.getMonth() + 3);

// Calendar functionality
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update header
    monthYearDisplay.textContent = currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Clear previous days
    calendarDays.innerHTML = '';
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Generate calendar days
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = date.getDate();
        
        const isCurrentMonth = date.getMonth() === month;
        const isToday = date.toDateString() === new Date().toDateString();
        const todayComparison = new Date();
        todayComparison.setHours(0, 0, 0, 0);
        const isPastDate = date < todayComparison;
        const isFutureLimit = date > maxDate;
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isSelected = selectedDateObj && date.toDateString() === selectedDateObj.toDateString();
        
        if (!isCurrentMonth || isPastDate || isFutureLimit || isWeekend) {
            dayElement.classList.add('disabled');
        } else {
            dayElement.addEventListener('click', () => selectDate(date));
        }
        
        if (isToday && isCurrentMonth) {
            dayElement.classList.add('today');
        }
        
        if (isSelected) {
            dayElement.classList.add('selected');
        }
        
        if (!isCurrentMonth) {
            dayElement.style.opacity = '0.3';
        }
        
        calendarDays.appendChild(dayElement);
    }
    
    // Update navigation buttons
    const prevMonth = new Date(year, month - 1, 1);
    const nextMonth = new Date(year, month + 1, 1);
    const todayMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    prevMonthBtn.disabled = prevMonth < todayMonth;
    nextMonthBtn.disabled = nextMonth > maxDate;
}

function selectDate(date) {
    selectedDateObj = new Date(date);
    selectedDateInput.value = date.toISOString().split('T')[0];
    
    const formattedDate = date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    calendarInput.value = formattedDate;
    closeCalendar();
    checkFormValidity();
}

function openCalendar() {
    calendarDropdown.classList.add('show');
    calendarInput.classList.add('open');
    renderCalendar();
}

function closeCalendar() {
    calendarDropdown.classList.remove('show');
    calendarInput.classList.remove('open');
}

// Calendar event listeners
calendarInput.addEventListener('click', function(e) {
    e.preventDefault();
    openCalendar();
});

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Close calendar when clicking outside
document.addEventListener('click', (e) => {
    if (!calendarInput.contains(e.target) && !calendarDropdown.contains(e.target)) {
        closeCalendar();
    }
});

// Time slot selection
timeSlots.forEach(slot => {
    slot.addEventListener('click', function() {
        // Remove selection from all slots
        timeSlots.forEach(s => s.classList.remove('selected'));
        // Add selection to clicked slot
        this.classList.add('selected');
        // Set hidden input value
        selectedTimeInput.value = this.dataset.time;
        checkFormValidity();
    });
});

// Phone number confirmation handling
phoneYes.addEventListener('change', function() {
    if (this.checked) {
        phoneInputSection.classList.remove('show');
        phoneNumber.removeAttribute('required');
        checkFormValidity();
    }
});

phoneNo.addEventListener('change', function() {
    if (this.checked) {
        phoneInputSection.classList.add('show');
        phoneNumber.setAttribute('required', 'required');
        checkFormValidity();
    }
});

phoneNumber.addEventListener('input', checkFormValidity);

// Form validation
function checkFormValidity() {
    const nameField = document.getElementById('clientName');
    const currentPhoneField = document.getElementById('currentPhone');
    const dateField = selectedDateInput;
    const timeField = selectedTimeInput;
    const phoneConfirmRadios = document.querySelectorAll('input[name="phoneConfirm"]');
    const phoneNumberField = document.getElementById('phoneNumber');
    
    let isValid = true;
    
    // Check name
    if (!nameField.value.trim()) isValid = false;
    
    // Check current phone (from URL or manually entered)
    if (!currentPhoneField.value.trim()) isValid = false;
    
    // Check date and time
    if (!dateField.value || !timeField.value) isValid = false;
    
    // Check phone confirmation
    const phoneConfirmChecked = Array.from(phoneConfirmRadios).some(radio => radio.checked);
    if (!phoneConfirmChecked) isValid = false;
    
    // If "No" is selected for phone, check if new phone number is provided
    if (phoneNo.checked && !phoneNumberField.value.trim()) isValid = false;
    
    // Update submit button
    if (isValid) {
        submitBtn.classList.add('active');
    } else {
        submitBtn.classList.remove('active');
    }
}

// Form submission with webhook
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!submitBtn.classList.contains('active')) {
        return;
    }
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.textContent = '';
    errorMessage.classList.add('hidden');
    
    // Get form data
    const formData = new FormData(this);
    const name = formData.get('clientName');
    const autofilledPhone = formData.get('currentPhone');
    const existingProjectInfoText = formData.get('existingProjectInfo');
    const jobDetailsText = formData.get('jobDetails');
    const date = formData.get('consultationDate');
    const time = formData.get('consultationTime');
    const phoneConfirm = formData.get('phoneConfirm');
    const finalPhone = phoneConfirm === 'yes' ? 
        document.getElementById('currentPhone').value : 
        formData.get('phoneNumber');
    
    // Prepare webhook data
    const webhookData = {
        // Customer Information (including autofilled data)
        clientName: name,
        autofilledPhone: autofilledPhone,
        phoneNumber: finalPhone,
        phoneNumberConfirmed: phoneConfirm === 'yes',
        originalPhoneNumber: document.getElementById('currentPhone').value,
        
        // Booking Details
        consultationDate: date,
        consultationTime: time,
        existingProjectInfo: existingProjectInfoText,
        additionalJobDetails: jobDetailsText,
        
        // Formatted dates for display
        formattedDate: selectedDateObj ? selectedDateObj.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }) : '',
        formattedTime: time ? (() => {
            const [hours, minutes] = time.split(':');
            const timeObj = new Date();
            timeObj.setHours(parseInt(hours), parseInt(minutes));
            return timeObj.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        })() : '',
        
        // Metadata
        submissionTimestamp: new Date().toISOString(),
        source: 'Trader Brothers Booking Form',
        userAgent: navigator.userAgent,
        
        // URL parameters (if any)
        urlParams: {
            name: urlParams.get('name'),
            phone: urlParams.get('phone'),
            projectInfo: urlParams.get('projectInfo')
        }
    };
    
    try {
        // Send to webhook
        const response = await fetch('https://hook.eu2.make.com/gtbaje58wtx1oqighk247djp2bwz5ise', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Format date and time for confirmation message
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long'
        });
        
        const [hours, minutes] = time.split(':');
        const timeObj = new Date();
        timeObj.setHours(parseInt(hours), parseInt(minutes));
        const formattedTime = timeObj.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        
        // Create personalized confirmation message
        const confirmationMessage = `Can't wait ${name}, looking forward to our chat on ${formattedDate} at ${formattedTime}. Have a great rest of your day!`;
        
        // Update confirmation message
        document.getElementById('confirmationMessage').textContent = confirmationMessage;
        
        // Create booking details summary
        const bookingDetails = document.getElementById('bookingDetails');
        let projectInfoHTML = '';
        if (existingProjectInfoText && existingProjectInfoText.trim()) {
            projectInfoHTML = `
            <p><strong>Existing Project Information:</strong></p>
            <p style="font-style: italic; margin-left: 15px; line-height: 1.4;">${existingProjectInfoText}</p>`;
        }
        if (jobDetailsText && jobDetailsText.trim()) {
            projectInfoHTML += `
            <p><strong>Additional Project Details:</strong></p>
            <p style="font-style: italic; margin-left: 15px; line-height: 1.4;">${jobDetailsText}</p>`;
        }
        
        bookingDetails.innerHTML = `
            <h4>📋 Your Consultation Details:</h4>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> ${finalPhone}</p>
            <p><strong>Date:</strong> ${webhookData.formattedDate}</p>
            <p><strong>Time:</strong> ${webhookData.formattedTime}</p>
            ${projectInfoHTML}
            <p style="margin-top: 15px; font-size: 14px; color: #666;"><strong>Confirmation sent at:</strong> ${new Date().toLocaleString('en-GB')}</p>
        `;
        
        // Show thank you modal
        document.getElementById('thankYouModal').classList.add('show');
        
    } catch (error) {
        console.error('Error submitting form:', error);
        errorMessage.classList.remove('hidden');
    } finally {
        // Reset button state
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'CONFIRM BOOKING';
    }
});

// Close modal function
function closeThankYouModal() {
    document.getElementById('thankYouModal').classList.remove('show');
}

// Initialize everything
checkFormValidity();

// Initial check for form validity when page loads
document.addEventListener('DOMContentLoaded', function() {
    checkFormValidity();
});
