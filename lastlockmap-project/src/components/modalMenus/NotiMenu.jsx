import React from 'react';
import Icon from '@mdi/react';
import { mdiBellOutline, mdiBell, mdiBellAlert } from '@mdi/js';

// handles the logic for the time selection popup menu
const NotiMenu = ({ isOpen, onStatusChange, currentStatus }) => {
    // styles for component
    const notificationMenuStyle = {
        position: 'absolute',
        top: '-178px',
        right: '10px',
        backgroundColor: '#333333',
        border: '1px solid #4091F7',
        borderRadius: '4px',
        padding: '1px 0',
        zIndex: 1001,
        width: '160px'
    };
    const menuItemStyle = {
        padding: '8px 12px',
        color: '#FFFFFF',
        cursor: 'pointer',
        fontSize: '14px',
        border: '0.1px solid #222222',
        ':hover': {
            backgroundColor: '#555555'
        },
    };
    const bellIconStyle = {
        position: 'absolute',
        top: '-5px',
        right: '35px',
        cursor: 'pointer'
    };

    // alters which bell icon is shown
    const renderBellIcon = () => {
        switch(currentStatus) {
            case 'always': // if current status is 'always', shows filled bell with !
                return <Icon path={mdiBellAlert} size={1} color="white" style={bellIconStyle}/>;
            case 'afterHours': // if current status is 'afterHours', shows filled bell
                return <Icon path={mdiBell} size={1} color="white" style={bellIconStyle}/>;
            default: // if current status is 'afterHours', shows bell outline
                return <Icon path={mdiBellOutline} size={1} color="white" style={bellIconStyle}/>;
        }
    };

    // pulls up a small modal with a notification selection menu
    return (
        <>
            {isOpen && (
                <div style={notificationMenuStyle}>
                    <div 
                        style={menuItemStyle} 
                    >
                        Notify...
                    </div>
                    <div 
                        style={menuItemStyle} 
                        onClick={() => onStatusChange('always')}
                    >
                        Every Entry
                    </div>
                    <div 
                        style={menuItemStyle} 
                        onClick={() => onStatusChange('afterHours')}
                    >
                        After Hours Entries
                    </div>
                    <div 
                        style={menuItemStyle} 
                        onClick={() => onStatusChange('off')}
                    >
                        Never
                    </div>
                </div>
            )}
            {renderBellIcon()}
        </>
    );
};

export default NotiMenu;