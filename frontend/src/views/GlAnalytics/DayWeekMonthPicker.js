import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export const CalendarSelector = ({
    defaultMode = 'day',
    onDateSelect,
    onWeekSelect,
    onMonthSelect,
    onCustomSelect,
    minDate = null,
    maxDate = null,
    disabledDates = [],
    className = '',
    showSelection = true,
}) => {
    const [mode, setMode] = useState(defaultMode);
    const [currentDate, setCurrentDate] = useState(new Date());
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    const [selectedDay, setSelectedDay] = useState(todayMidnight);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const dropdownRef = useRef(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setShowCustomPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper to format date as dd/mm/yyyy
    const formatDate = (date) => {
        if (!date || isNaN(date.getTime())) return '';
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    // Format for input fields (yyyy-mm-dd)
    const formatDateForInput = (date) => {
        if (!date) return '';
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    // Check if date is disabled or in future
    const isFutureDate = (date) => date > today;
    const isDateDisabled = (date) => {
        if (minDate && date < minDate) return true;
        if (maxDate && date > maxDate) return true;
        if (isFutureDate(date)) return true;
        return disabledDates.some(d =>
            d.getDate() === date.getDate() &&
            d.getMonth() === date.getMonth() &&
            d.getFullYear() === date.getFullYear()
        );
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const getWeekDays = (date, restrictToMonth = false) => {
        const day = date.getDay();
        const diff = date.getDate() - day;
        let sunday = new Date(date);
        sunday.setDate(diff);

        const week = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(sunday);
            d.setDate(sunday.getDate() + i);

            if (restrictToMonth && d.getMonth() !== date.getMonth()) continue;
            if (d > today) break;

            week.push(d);
        }
        return week;
    };

    const isDateInWeek = (date, weekStart) => {
        if (!weekStart) return false;
        const dayOfWeek = weekStart.getDay();
        const sunday = new Date(weekStart);
        sunday.setDate(weekStart.getDate() - dayOfWeek);
        sunday.setHours(0, 0, 0, 0);
        const week = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(sunday);
            d.setDate(sunday.getDate() + i);
            if (d > today) break;
            week.push(d);
        }
        return week.some(d =>
            d.getDate() === date.getDate() &&
            d.getMonth() === date.getMonth() &&
            d.getFullYear() === date.getFullYear()
        );
    };

    const handlePrevious = () => {
        const newDate = new Date(currentDate);
        if (mode === 'month') {
            newDate.setFullYear(newDate.getFullYear() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() - 1);
        }
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (mode === 'month') {
            newDate.setFullYear(newDate.getFullYear() + 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };

    const handleDayClick = (day) => {
        const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 0, 0, 0, 0);
        if (isDateDisabled(selected)) return;

        if (mode === 'day') {
            setSelectedDay(selected);
            setSelectedWeek(null);
            setSelectedMonth(null);
            if (onDateSelect) {
                onDateSelect(formatDate(selected));
            }
        } else if (mode === 'week') {
            setSelectedWeek(selected);
            setSelectedDay(null);
            setSelectedMonth(null);

            // Always compute the full Sun–Sat week, then cap at today
            const dayOfWeek = selected.getDay(); // 0=Sun, 1=Mon, …
            const sunday = new Date(selected);
            sunday.setDate(selected.getDate() - dayOfWeek); // rewind to Sunday
            sunday.setHours(0, 0, 0, 0);

            const weekDays = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(sunday);
                d.setDate(sunday.getDate() + i);
                if (d > today) break;
                weekDays.push(d);
            }

            if (onWeekSelect) {
                onWeekSelect({
                    startDate: formatDate(weekDays[0]),
                    endDate: formatDate(weekDays[weekDays.length - 1]),
                    days: weekDays.map(d => formatDate(d))
                });
            }
        }
    };

    const handleMonthClick = (monthIndex) => {
        const selected = new Date(currentDate.getFullYear(), monthIndex, 1);
        if (isFutureDate(selected)) return;

        setSelectedMonth(selected);
        setSelectedDay(null);
        setSelectedWeek(null);

        const toDate = (selected.getFullYear() === today.getFullYear() && selected.getMonth() === today.getMonth())
            ? today
            : new Date(selected.getFullYear(), selected.getMonth() + 1, 0);

        if (onMonthSelect) onMonthSelect({
            startDate: formatDate(selected),
            endDate: formatDate(toDate)
        });
    };

    const handleModeChange = (newMode) => {
        if (mode === newMode && isOpen) {
            setIsOpen(false);
            return;
        }
        setMode(newMode);
        setIsOpen(true);
        setShowCustomPicker(false);
        // Clear custom date inputs whenever switching to day/week/month
        setCustomStartDate('');
        setCustomEndDate('');
    };

    const handleCustomDateApply = () => {
        if (customStartDate && customEndDate) {
            const start = new Date(customStartDate);
            const end = new Date(customEndDate);
            
            if (start <= end && end <= today) {
                if (onCustomSelect) {
                    onCustomSelect({
                        startDate: formatDate(start),
                        endDate: formatDate(end)
                    });
                }
                setShowCustomPicker(false);
                setIsOpen(false);
            } else {
                alert('Please select valid dates. End date must be after start date and not in the future.');
            }
        }
    };

    const renderDayView = () => {
        const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
        const days = [];

        // Empty cells for days before the month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} style={{ height: '36px' }} />);
        }

        // Actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isDisabled = isDateDisabled(date);
            const isSelected = mode === 'day' && selectedDay?.getDate() === day && selectedDay?.getMonth() === month && selectedDay?.getFullYear() === year;
            const isInSelectedWeek = mode === 'week' && isDateInWeek(date, selectedWeek);

            days.push(
                <button
                    key={day}
                    onClick={() => !isDisabled && handleDayClick(day)}
                    disabled={isDisabled}
                    style={{
                        height: '36px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        backgroundColor: isSelected || isInSelectedWeek ? '#2563eb' : 'transparent',
                        color: isSelected || isInSelectedWeek ? '#fff' : isDisabled ? '#d1d5db' : '#374151',
                        fontSize: '14px',
                        fontWeight: isSelected || isInSelectedWeek ? '600' : '400',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        if (!isDisabled && !isSelected && !isInSelectedWeek) {
                            e.target.style.backgroundColor = '#f3f4f6';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isDisabled && !isSelected && !isInSelectedWeek) {
                            e.target.style.backgroundColor = 'transparent';
                        }
                    }}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    const renderMonthView = () => {
        return months.map((month, index) => {
            const monthDate = new Date(currentDate.getFullYear(), index, 1);
            const isDisabled = isFutureDate(monthDate);
            const isSelected = mode === 'month' && selectedMonth?.getMonth() === index && selectedMonth?.getFullYear() === currentDate.getFullYear();

            return (
                <button
                    key={month}
                    onClick={() => !isDisabled && handleMonthClick(index)}
                    disabled={isDisabled}
                    style={{
                        padding: '12px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        backgroundColor: isSelected ? '#2563eb' : 'transparent',
                        color: isSelected ? '#fff' : isDisabled ? '#d1d5db' : '#374151',
                        fontSize: '14px',
                        fontWeight: isSelected ? '600' : '400',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        if (!isDisabled && !isSelected) {
                            e.target.style.backgroundColor = '#f3f4f6';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isDisabled && !isSelected) {
                            e.target.style.backgroundColor = 'transparent';
                        }
                    }}
                >
                    {month}
                </button>
            );
        });
    };

    const formatSelection = () => {
        if (mode === 'day' && selectedDay) {
            return `Selected: ${formatDate(selectedDay)}`;
        } else if (mode === 'week' && selectedWeek) {
            const dayOfWeek = selectedWeek.getDay();
            const sunday = new Date(selectedWeek);
            sunday.setDate(selectedWeek.getDate() - dayOfWeek);
            sunday.setHours(0, 0, 0, 0);
            const weekDays = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(sunday);
                d.setDate(sunday.getDate() + i);
                if (d > today) break;
                weekDays.push(d);
            }
            return `Selected Week: ${formatDate(weekDays[0])} - ${formatDate(weekDays[weekDays.length - 1])}`;
        } else if (mode === 'month' && selectedMonth) {
            const toDate = (selectedMonth.getFullYear() === today.getFullYear() && selectedMonth.getMonth() === today.getMonth())
                ? today
                : new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
            return `Selected Month: ${formatDate(selectedMonth)} - ${formatDate(toDate)}`;
        }
        return 'No selection';
    };

    const modeButtonStyle = (isActive) => ({
        padding: '8px 20px',
        borderRadius: '8px',
        fontWeight: '500',
        fontSize: '14px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: isActive ? '#2563eb' : '#e5e7eb',
        color: isActive ? '#fff' : '#374151'
    });

    const navButtonStyle = {
        padding: '8px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative', width: 'fit-content' }} className={className}>
            <div style={{ display: 'flex', gap: '8px', backgroundColor: '#e5e7eb', padding: '4px', borderRadius: '8px' }}>
              <button 
  onClick={() => handleModeChange('day')} 
  style={modeButtonStyle(mode === 'day')}
>
  Day
</button>

<button 
  onClick={() => handleModeChange('week')} 
  style={modeButtonStyle(mode === 'week')}
>
  Week
</button>

<button 
  onClick={() => handleModeChange('month')} 
  style={modeButtonStyle(mode === 'month')}
>
  Month
</button>

<button 
  onClick={() => {
      setCustomStartDate('');
      setCustomEndDate('');
      setShowCustomPicker(!showCustomPicker);
      setIsOpen(true);
      setMode('custom');
  }} 
  style={modeButtonStyle(mode === 'custom')}
>
  <Calendar size={16} />
</button>

            </div>

            {isOpen && !showCustomPicker && (
                <div style={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)', 
                    padding: '20px', 
                    position: 'absolute', 
                    top: 'calc(100% + 8px)',
                    right: 0,
                    zIndex: 1001, 
                    minWidth: '320px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <button onClick={handlePrevious} style={navButtonStyle}>
                            <ChevronLeft size={20} />
                        </button>
                        <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                            {mode === 'month' ? currentDate.getFullYear() : `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                        </h2>
                        <button onClick={handleNext} style={navButtonStyle}>
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {mode !== 'month' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                            {daysOfWeek.map(day => (
                                <div key={day} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {day}
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: mode === 'month' ? 'repeat(3, 1fr)' : 'repeat(7, 1fr)', gap: '4px' }}>
                        {mode === 'month' ? renderMonthView() : renderDayView()}
                    </div>

                    {showSelection && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', fontSize: '13px', color: '#6b7280' }}>
                            {formatSelection()}
                        </div>
                    )}
                </div>
            )}

            {showCustomPicker && (
                <div style={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)', 
                    padding: '20px', 
                    position: 'absolute', 
                    top: 'calc(100% + 8px)',
                    right: 0,
                    zIndex: 1001, 
                    minWidth: '300px',
                }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                        Custom Date Range
                    </h3>
                    
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            max={formatDateForInput(today)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                            End Date
                        </label>
                        <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            max={formatDateForInput(today)}
                            min={customStartDate}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <button
                        onClick={handleCustomDateApply}
                        disabled={!customStartDate || !customEndDate}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: (!customStartDate || !customEndDate) ? '#d1d5db' : '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: (!customStartDate || !customEndDate) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Apply
                    </button>
                </div>
            )}
        </div>
    );
};