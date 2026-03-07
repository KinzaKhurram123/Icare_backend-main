# Doctor Login Credentials

## Existing Doctors in Database:

### Doctor 1
- **Email**: doctor@gmail.com
- **Password**: 123456
- **Name**: doctor
- **Specialization**: Not set (General Practitioner by default)

### Doctor 2
- **Email**: doctor2@gmail.com  
- **Password**: 123456
- **Name**: doctor2
- **Specialization**: Cardiologist
- **Clinic**: Heart Care Clinic
- **Experience**: 10 years
- **Available Days**: Monday, Wednesday, Friday
- **Available Time**: 10:00 AM - 2:00 PM

## How to Login as Doctor:

1. Open the app
2. Click "Login"
3. Enter email: `doctor@gmail.com` or `doctor2@gmail.com`
4. Enter password: `123456`
5. Click Login

## To Create a New Doctor Account:

1. Click "Sign Up"
2. Select "Doctor" role
3. Fill in details:
   - Name: Your name
   - Email: your-email@gmail.com
   - Phone: Your phone number
   - Password: Your password
4. Click Sign Up

Note: The default password for test accounts is `123456`

## Testing Appointment Flow:

1. **As Patient** (kinza@gmail.com):
   - Browse doctors
   - Book appointment with doctor@gmail.com or doctor2@gmail.com

2. **As Doctor** (doctor@gmail.com):
   - Login with doctor credentials
   - Go to "My Appointments" from sidebar
   - See appointments booked by patients
   - Accept/Reject pending appointments
   - Mark confirmed appointments as completed
