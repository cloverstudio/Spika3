const en = {
    firstName: "First name",
    lastName: "Last name",
    gender: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    dob: "Date of birth",
    email: "Email",
    country: "Country",
    city: "City",
    enter: "Enter",
    selectOrEnter: "Select or enter",
    startTyping: "Start typing",
    select: "Select",
    ddmmyy: "DD/MM/YY",
    next: "Next",
    loadingText: "Loading...",
    personalInformation: "Personal information",
    save: "Save",
    apply: "Apply",
    ageRange: "Age range",
    minAge: "Min age",
    maxAge: "Max age",
    filters: "Filters",
    noContacts: "No contacts",
    reset: "Reset",
};

const strings = {
    en,
};

export default function useStrings(lang: "en") {
    return strings[lang];
}
