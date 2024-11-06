import React, { useEffect, useState } from 'react';
import TimePicker from 'react-time-picker';
import { ChevronLeft } from 'lucide-react';

const TimePickerMenu = ({ isOpen, onClose, onTimeSet, type = 'opening', onStepChange, onTypeChange }) => {
    const [selectedTime, setSelectedTime] = useState(null);
    const [step, setStep] = useState(1);

    const menuStyle = {
        position: 'absolute',
        top: '-182px',
        left: '27%',
        transform: 'translateX(-50%)',
        backgroundColor: '#333333',
        border: '1px solid #4091F7',
        borderRadius: '4px',
        padding: '12px',
        zIndex: 1001,
        width: '200px'
    };
    
    const headerStyle = {
        color: '#FFFFFF',
        margin: '0 0 12px 0',
        fontSize: '16px',
        fontWeight: '500',
        textAlign: 'center',
        position: 'relative'
    };
    
    const buttonStyle = {
        backgroundColor: '#4091F7',
        color: '#FFFFFF',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        width: '100%',
        marginTop: '12px'
    };
    
    const cancelButtonStyle = {
        ...buttonStyle,
        backgroundColor: 'transparent',
        border: '1px solid #4091F7',
        marginTop: '8px'
    };

    const backButtonStyle = {
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        color: '#FFFFFF',
        cursor: 'pointer',
        padding: 0,
        display: 'flex',
        alignItems: 'center'
    };

    const handleNextStep = () => {
        if (selectedTime) {
            onTimeSet(selectedTime, type);
            if (step === 1) {
                setStep(2);
                onStepChange(2);
            } else {
                onClose();
            }
            if (type === 'opening') {
                onTypeChange('closing')
            } else {
                onTypeChange('opening')
            }
        }
        setSelectedTime(null)
    };

    const handleBack = () => {
        setStep(1);
        onStepChange(1);
        if (type === 'opening') {
            onTypeChange('closing')
        } else {
            onTypeChange('opening')
        }
        setSelectedTime(null)
    };

    if (!isOpen) return null;

    const getHeaderText = () => {
        return type === 'opening' ? 'Opening Time' : 'Closing Time';
    };

    const getButtonText = () => {
        if (step === 2) return 'Set Hours';
        return type === 'opening' ? 'Set Opening Time' : 'Set Closing Time';
    };

    return (
        <div style={menuStyle}>
            <div style={headerStyle}>
                {step === 2 && (
                    <button style={backButtonStyle} onClick={handleBack}>
                        <ChevronLeft size={20} />
                    </button>
                )}
                {getHeaderText()}
            </div>
            
            <TimePicker
                onChange={setSelectedTime}
                value={selectedTime}
                clockIcon={null}
                clearIcon={null}
                className="time-picker"
            />
            
            <button 
                style={buttonStyle} 
                onClick={handleNextStep}
                disabled={!selectedTime}
            >
                {getButtonText()}
            </button>
            
            <button 
                style={cancelButtonStyle}
                onClick={onClose}
            >
                Cancel
            </button>
        </div>
    );
};

export default TimePickerMenu;