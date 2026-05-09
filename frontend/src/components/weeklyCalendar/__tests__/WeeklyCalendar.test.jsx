import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WeeklyCalendar from '../WeeklyCalendar';

const baseProps = {
  role: 'admin',
  daysToRender: ['SEGUNDA'],
  classesInCurrentWeek: [],
  getDayLayoutMap: () => ({}),
  calculatePosition: () => ({ top: '0px', height: '80px', width: '100%', left: '0%' }),
  activeSlotMenu: null,
  setActiveSlotMenu: vi.fn(),
  activeClassMenu: null,
  setActiveClassMenu: vi.fn(),
  openNewClassFromSlot: vi.fn(),
  openTemplatePickerFromSlot: vi.fn(),
  getIsoDateForDay: () => '2026-05-04',
  handleEditClass: vi.fn(),
  handleAskDeleteClass: vi.fn(),
  onGoToDailyView: vi.fn(),
};

const renderWithState = (props = {}) => {
  const mergedProps = { ...baseProps, ...props };

  const Wrapper = () => {
    const [activeSlotMenu, setActiveSlotMenu] = useState(null);
    const [activeClassMenu, setActiveClassMenu] = useState(null);

    return (
      <WeeklyCalendar
        {...mergedProps}
        activeSlotMenu={activeSlotMenu}
        setActiveSlotMenu={setActiveSlotMenu}
        activeClassMenu={activeClassMenu}
        setActiveClassMenu={setActiveClassMenu}
      />
    );
  };

  return render(<Wrapper />);
};

describe('WeeklyCalendar', () => {
  it('shows a create slot button for free admin slots and opens the slot menu', () => {
    renderWithState();

    const createButtons = screen.getAllByTitle('Adicionar aula neste slot');
    expect(createButtons).toHaveLength(10);

    fireEvent.click(createButtons[1]);

    expect(screen.getByText('+ Nova Aula')).toBeInTheDocument();
  });

  it('does not show a create button on an occupied slot', () => {
    renderWithState({
      classesInCurrentWeek: [{ id: 1, day: 'SEGUNDA', start: 8, duration: 1, categoryName: 'Ballet', occupancy: '0/20' }],
    });

    const createButtons = screen.getAllByTitle('Adicionar aula neste slot');
    expect(createButtons).toHaveLength(9);
    expect(screen.getByText('Ballet')).toBeInTheDocument();
  });

  it('calls the daily view handler when a clustered class card is clicked', () => {
    renderWithState({
      classesInCurrentWeek: [
        { id: 1, day: 'SEGUNDA', start: 8, duration: 2, categoryName: 'Ballet', occupancy: '0/20' },
        { id: 2, day: 'SEGUNDA', start: 8.5, duration: 2, categoryName: 'Contemporânea', occupancy: '0/20' },
        { id: 3, day: 'SEGUNDA', start: 9, duration: 1.5, categoryName: 'Jazz', occupancy: '0/20' },
      ],
    });

    fireEvent.click(screen.getByText('3 Aulas neste momento'));

    expect(baseProps.onGoToDailyView).toHaveBeenCalledWith('SEGUNDA');
  });
});
