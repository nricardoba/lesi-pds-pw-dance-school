import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DaysTabs from '../DaysTabs';

describe('DaysTabs', () => {
  it('renders today highlight and allows selecting a day', () => {
    const onSelectDay = vi.fn();

    render(
      <DaysTabs
        viewMode="weekly"
        selectedDay="Todos os dias"
        onSelectDay={onSelectDay}
        dayEntries={[
          { day: 'SEGUNDA', short: 'SEG', date: '4', isoDate: '2026-05-04' },
          { day: 'SÁBADO', short: 'SÁB', date: '9', isoDate: '2026-05-09' },
        ]}
        todayDateIso="2026-05-09"
      />
    );

    expect(screen.getByText('TODOS')).toBeInTheDocument();
    expect(screen.getByText('SÁB').closest('button')).toHaveClass('day-tab--today');

    fireEvent.click(screen.getByText('SEG'));

    expect(onSelectDay).toHaveBeenCalledWith('SEGUNDA');
  });

  it('renders daily tabs without the all-days option', () => {
    const onSelectDay = vi.fn();

    render(
      <DaysTabs
        viewMode="daily"
        selectedDay="SEGUNDA"
        onSelectDay={onSelectDay}
        currentWeek={[
          { day: 'SEGUNDA', short: 'SEG', date: '4', isoDate: '2026-05-04' },
        ]}
      />
    );

    expect(screen.queryByText('TODOS')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('SEG'));
    expect(onSelectDay).toHaveBeenCalledWith('SEGUNDA');
  });
});
