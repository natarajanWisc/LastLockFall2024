import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { roomLog, batteryPercentage } from '../assets/sampleRoomData';
import NotiMenu from './modalMenus/NotiMenu';
import TimePickerMenu from './modalMenus/TimePickerMenu';

// Functional component to render a battery icon with dynamic fill based on percentage
const BatteryIcon = ({ percentage }) => (
    <svg width="22" height="10" viewBox="0 0 40 20" style={{ position: 'absolute', top: '15', right: '10' }}>
        {/* Outer battery container */}
        <rect x="1" y="1" width="34" height="18" rx="3" ry="3" fill="none" stroke="white" strokeWidth="2" />
        {/* Battery's positive terminal */}
        <rect x="35" y="6" width="4" height="8" rx="2" ry="2" fill="white" />
        {/* Battery level indicator with dynamic width and color */}
        <rect x="3" y="3" width={percentage * 0.3} height="14" fill={percentage > 20 ? "#4091F7" : "red"} />
    </svg>
);

// Main component to display a hoverable room modal
const HoverRoomModal = ({ room, style }) => {

    // Helper function to generate a local storage key based on room name
    const getHoursStorageKey = () => {
        return `room_hours_${room.name.toLowerCase().replace(/\s+/g, '_')}`;
    };

    // Retrieve saved hours from localStorage using the generated key
    const savedHours = localStorage.getItem(getHoursStorageKey());

    // State management for hover interaction
    const [isHovered, setIsHovered] = useState(false);

    // Function to handle mouse entering the modal
    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    // Function to handle mouse leaving the modal with a slight delay
    const handleMouseLeave = () => {
        setTimeout(() => {
            setIsHovered(false);
        }, 200); // Adjust delay as needed
    };

    // Styles for the hover modal container
    const hoverModalStyle = {
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#333333',
        border: `2px solid ${room.color || '#4091F7'}`, // Default color fallback
        borderRadius: '8px',
        padding: '10px',
        zIndex: 1000,
        maxWidth: '200px', // Reduced width for compact design
        width: '100%',
        fontFamily: '"Roboto", sans-serif',
        fontWeight: 300,
        fontStyle: 'normal',
        boxShadow: '12px 7px 7px' // Adds depth
    };

    // Styles for the modal header
    const headerStyle = {
        color: '#FFFFFF',
        marginTop: '0',
        marginBottom: '10px', // Reduced margin for spacing
        fontSize: '15px' // Adjusted font size for compact design
    };

    // Styles for the hours information section
    const hoursInfoStyle = {
        color: '#FFFFFF',
        fontSize: '10px' // Smaller font for subtle appearance
    };

    return (
        <div id='hover-modal'
            style={{ ...hoverModalStyle, ...style }} // Merge external and internal styles
            onMouseEnter={handleMouseEnter} // Trigger hover state on mouse enter
            onMouseLeave={handleMouseLeave} // Reset hover state on mouse leave
        >
            {/* Room name header */}
            <h2 style={headerStyle}>{room.name}</h2>

            {/* Battery icon indicating battery percentage */}
            <BatteryIcon percentage={batteryPercentage} />

            {/* Display room hours, with fallback text if not specified */}
            <p style={hoursInfoStyle}>
                <strong>Hours: </strong> 
                {savedHours ? savedHours : "Not Specified"}
            </p>
        </div>
    );
};

export default HoverRoomModal;
