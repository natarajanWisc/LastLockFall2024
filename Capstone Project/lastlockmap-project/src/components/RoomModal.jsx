import React from 'react';

const RoomModal = ({ room, onClose }) => {
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
        maxWidth: '400px',
        width: '100%',
    };

    const headerStyle = {
        color: '#FFFFFF',
        marginTop: '0',
        marginBottom: '20px',
        borderBottom: '1px solid #4091F7',
        paddingBottom: '10px',
    };

    const infoStyle = {
        color: '#FFFFFF',
        marginBottom: '10px',
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

    // creates the modal for each room
    return (
        <div style={modalStyle}>
        <h2 style={headerStyle}>{room.name}</h2>
        <p style={infoStyle}><strong>Hours:</strong> {room.hours}</p>
        <p style={infoStyle}><strong>Last Entry:</strong> {room.lastEntry}</p>
        <p style={infoStyle}><strong>Lock Battery:</strong> {room.lockBattery}</p>
        <button style={closeButtonStyle} onClick={onClose}>Close</button>
        </div>
    );
};

export default RoomModal;