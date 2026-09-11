import { useState } from "react";

const INITIAL_SCHOOLS = [
    "Green Valley High", 
    "Oxford International School",
    "Sunrise Public School", 
    "St. Mary's School", 
];

let globalSchools = [...INITIAL_SCHOOLS];

export function useAdminSchools() {
    const [schools, setSchools] = useState(globalSchools);
    
    const addSchool = (schoolName) => {
        if (!globalSchools.includes(schoolName)) {
            globalSchools = [...globalSchools, schoolName].sort();
            setSchools([...globalSchools]);
        }
    };
    
    const deleteSchool = (schoolName) => {
        globalSchools = globalSchools.filter(s => s !== schoolName);
        setSchools([...globalSchools]);
    };
    
    return { schools, addSchool, deleteSchool };
}
