import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { roomLog, batteryPercentage } from '../assets/sampleRoomData';
import NotiMenu from './modalMenus/NotiMenu';
import TimePickerMenu from './modalMenus/TimePickerMenu';

const RoomModal = ({ room, onClose }) => {
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [roomHours, setRoomHours] = useState(null)
    const [alertStatus, setAlertStatus] = useState("off")
    const [isNotiMenuOpen, setIsNotiMenuOpen] = useState(false);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    const [timePickerType, setTimePickerType] = useState('opening');
    const [openingTime, setOpeningTime] = useState(null);
    const [closingTime, setClosingTime] = useState(null);
    const [timePickerStep, setTimePickerStep] = useState(1);

    useEffect(() => {
        const savedHours = localStorage.getItem(getHoursStorageKey());
        if (savedHours) {
            const [opening, closing] = savedHours.split(' - ');
            if (opening !== '??:??') setOpeningTime(opening);
            if (closing !== '??:??') setClosingTime(closing);
        }
    }, []);

    useEffect(() => {
        const savedHours = localStorage.getItem(getHoursStorageKey());
        if (savedHours) {
            setRoomHours(savedHours);
        }
        const savedAlertStatus = localStorage.getItem(getAlertStorageKey());
        if (savedAlertStatus) {
            setAlertStatus(savedAlertStatus);
        }

        // Close notification menu when clicking outside
        const handleClickOutside = (event) => {
            if (!event.target.closest('.notification-menu') && 
                !event.target.closest('.bell-icon')) {
                setIsNotiMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);

    }, [room.name, alertStatus]);

    const modalStyle = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#333333',
        border: '2px solid #4091F7',
        borderRadius: '8px',
        padding: '20px',
        zIndex: 1000,
        maxWidth: '500px',
        width: '100%',
        fontFamily: '"Roboto", sans-serif',
        fontWeight: 300,
        fontStyle: 'normal'
    };

    const headerStyle = {
        color: '#FFFFFF',
        marginTop: '0',
        marginBottom: '20px',
        borderBottom: '1px solid #4091F7',
        paddingBottom: '10px',
        position: 'relative',
    };

    const hoursInfoStyle = {
        color: '#FFFFFF',
        marginBottom: '10px',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    };

    const logInfoStyle = {
        color: '#FFFFFF',
        marginBottom: '10px',
        fontSize: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    };

    const logLineStyle = {
        color: '#FFFFFF',
        marginBottom: '10px',
        marginRight: '10px',
        fontSize: '16px',
        fontStyle: 'normal'
    };

    const closeButtonStyle = {
        backgroundColor: '#4091F7',
        color: '#FFFFFF',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        float: 'right',
    };

    const dropdownStyle = {
        backgroundColor: '#444444',
        border: '1px solid #4091F7',
        borderRadius: '4px',
        maxHeight: '200px',
        overflowY: 'auto',
    };

    const dropdownItemStyle = {
        padding: '10px',
        borderBottom: '1px solid #555555',
    };

    const toggleLogStyle = {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#FFFFFF',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: 0,
    };

    // Generate a unique key for localStorage
    const getHoursStorageKey = () => {
        return `room_hours_${room.name.toLowerCase().replace(/\s+/g, '_')}`;
    };

    // Generate a unique key for localStorage
    const getAlertStorageKey = () => {
        return `alert_status_${room.name.toLowerCase().replace(/\s+/g, '_')}`;
    };

    const BatteryIcon = ({ percentage }) => (
        <svg width="26" height="14" viewBox="0 0 40 20" style={{ position: 'absolute', top: '0', right: '0' }}>
            <rect x="1" y="1" width="34" height="18" rx="3" ry="3" fill="none" stroke="white" strokeWidth="2" />
            <rect x="35" y="6" width="4" height="8" rx="2" ry="2" fill="white" />
            <rect x="3" y="3" width={percentage * 0.3} height="14" fill={percentage > 20 ? "#4091F7" : "red"} />
        </svg>
    );

    const sortedLog = [...roomLog].sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`));

    const mostRecent =  `${roomLog[0].name} (${roomLog[0].hierarchy}) - ${roomLog[0].date} ${roomLog[0].time}`
    
    const handleTimeSet = (time, type) => {
        if (timePickerStep === 1) {
            if (type === 'opening') {
                setOpeningTime(time);
                setTimePickerType('closing');
            } else {
                setClosingTime(time);
                setTimePickerType('opening');
            }
        } else {
            if (type === 'closing') {
                setClosingTime(time);
            } else {
                setOpeningTime(time);
            }
            const hours = `${openingTime || '??:??'} - ${closingTime || '??:??'}`;
            setRoomHours(hours);
            localStorage.setItem(getHoursStorageKey(), hours);
        }
    };

    const handleNotiChange = (status) => {
        setAlertStatus(status);
        localStorage.setItem(getAlertStorageKey(), status);
        console.log(getAlertStorageKey());
        setIsNotiMenuOpen(false);
    };

    return (
        <div style={modalStyle}>
            <h2 style={headerStyle}>
                {room.name}
                <div 
                    className="bell-icon"
                    onClick={() => setIsNotiMenuOpen(!isNotiMenuOpen)}
                >
                    <NotiMenu 
                        isOpen={isNotiMenuOpen}
                        onStatusChange={handleNotiChange}
                        currentStatus={alertStatus}
                    />
                </div>
                <BatteryIcon percentage={batteryPercentage} />
            </h2>
            <p style={hoursInfoStyle}>
                <strong>Hours:</strong> 
                <span 
                    onClick={() => {
                        setTimePickerType('opening');
                        setIsTimePickerOpen(true);
                        // setTimePickerStep(1); // NEW
                    }}
                    style={{ cursor: 'pointer', color: '#FFFFFF' }}
                >
                    {openingTime ? openingTime : '??:??'}
                </span>
                {' - '}
                <span
                    onClick={() => {
                        setTimePickerType('closing');
                        setIsTimePickerOpen(true);
                        // setTimePickerStep(1); // NEW
                    }}
                    style={{ cursor: 'pointer', color: '#FFFFFF' }}
                >
                    {closingTime ? closingTime : '??:??'}
                </span>
                <TimePickerMenu
                    isOpen={isTimePickerOpen}
                    onClose={() => {
                        setIsTimePickerOpen(false);
                        setTimePickerStep(1); // NEW
                    }}
                    onTimeSet={handleTimeSet}
                    onStepChange={setTimePickerStep} // NEW
                    type={timePickerType}
                    onTypeChange = {setTimePickerType}
                />
            </p>
            <div style={logInfoStyle}>
                <button onClick={() => setIsLogOpen(!isLogOpen)} style={toggleLogStyle}>
                    <p style={logLineStyle}><strong>Entry Log: </strong>{mostRecent}</p>
                    {isLogOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {isLogOpen && (
                    <div style={dropdownStyle}>
                        {sortedLog.map((entry, index) => (
                            <div key={index} style={dropdownItemStyle}>
                                {entry.name} ({entry.hierarchy}) - {entry.date} {entry.time}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <button style={closeButtonStyle} onClick={onClose}>Close</button>
        </div>
    );
};

export default RoomModal;