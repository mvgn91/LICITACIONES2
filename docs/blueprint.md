# **App Name**: Pietra Fina v2.0

## Core Features:

- Real-time Contract List: Display a list of contracts with real-time updates from Firestore, showing key details and progress.
- Interactive Contract Details: Show all contract information and a list of estimations. Allow users to modify checkboxes and add new estimations, syncing with Firestore in real time.
- Progress Calculation Tool: Calculate contract progress automatically, using data in the system. Present it clearly on the UI. Use reasoning to ensure accurate values are derived from the data when present; and otherwise ignore it when absent.
- Dynamic Form Generation: Dynamically generate forms (AddContractModal and AddEstimationModal) based on the Firestore schema for easy data input.
- File Upload to Storage: Enable users to upload files (evidencias) to Firebase Storage and store the URLs in the corresponding estimation documents.
- Backend API with Cloud Functions: Develop a serverless API using Cloud Functions for Firebase to handle CRUD operations on contracts and estimations.

## Style Guidelines:

- Primary color: White (#FFFFFF) for a clean and modern base.
- Secondary color: Black (#000000) for text and important UI elements.
- Accent color: Red (#FF0000) for highlighting key actions and elements, in line with Material Design You.
- Body font: 'Roboto', a standard sans-serif font that provides a neutral and modern look.
- Headline font: 'Fair Display' for titles to add elegance.
- Single-pane dashboard layout for a clear and efficient user experience, following Material Design principles.
- Use minimalist icons for contract status and actions, ensuring clarity and ease of use, consistent with Material Design You.
- Subtle transitions and animations to provide visual feedback and enhance the user experience when data is updated or actions are performed, in line with Material Design You.