import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  buildMonthCells,
  canGoToNextMonth,
  canGoToPreviousMonth,
  fromIsoDate,
  getBirthYears,
  getToday,
  isFutureDate,
  toIsoDate,
} from '@/modules/profile/domain/birthDate';
import { PROFILE_STRINGS } from '@/modules/profile/ui/strings';
import { formatLongDate, MONTHS } from '@/shared/lib/formatDate';
import {
  BORDER_WIDTH,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  OPACITY,
  RADIUS,
  SIZE,
  SPACING,
} from '@/shared/theme';
import { Icon, type IconName } from '@/shared/ui/atoms/Icon';

const STRINGS = PROFILE_STRINGS.editProfile;
const DAY_CELL_WIDTH = `${100 / 7}%`;
const YEAR_CELL_WIDTH = '25%';
const YEAR_LIST_MAX_HEIGHT = 220;

type BirthDateFieldProps = {
  // ISO date (YYYY-MM-DD) or an empty string.
  value: string;
  onChange: (isoDate: string) => void;
};

// Calendar built on plain views, so it behaves the same on web, Android and iOS.
export function BirthDateField({ value, onChange }: BirthDateFieldProps) {
  const today = getToday();
  const selected = value !== '' ? fromIsoDate(value) : null;
  const [isOpen, setIsOpen] = useState(false);
  const [isChoosingYear, setIsChoosingYear] = useState(false);
  const [view, setView] = useState({ year: today.year, month: today.month });

  function handleToggle() {
    if (!isOpen) {
      setView(selected ?? { year: today.year, month: today.month });
      // Without a date the year comes first: a birth date is usually decades away.
      setIsChoosingYear(selected === null);
    }
    setIsOpen((current) => !current);
  }

  function handleMoveMonth(delta: number) {
    setView(({ year, month }) => {
      const moved = new Date(Date.UTC(year, month + delta, 1));
      return { year: moved.getUTCFullYear(), month: moved.getUTCMonth() };
    });
  }

  function handleSelectYear(year: number) {
    setView(({ month }) => ({
      year,
      month: year === today.year ? Math.min(month, today.month) : month,
    }));
    setIsChoosingYear(false);
  }

  function handleSelectDay(day: number) {
    onChange(toIsoDate({ year: view.year, month: view.month, day }));
    setIsOpen(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{PROFILE_STRINGS.info.birthDate}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${PROFILE_STRINGS.info.birthDate}: ${
          value !== '' ? formatLongDate(value) : STRINGS.birthDatePlaceholder
        }`}
        accessibilityState={{ expanded: isOpen }}
        onPress={handleToggle}
        style={({ pressed }) => [styles.field, pressed && styles.pressed]}
      >
        <Text style={value !== '' ? styles.fieldValue : styles.fieldPlaceholder}>
          {value !== '' ? formatLongDate(value) : STRINGS.birthDatePlaceholder}
        </Text>
        <Icon name="calendar" size={SIZE.icon} color={COLORS.primary} />
      </Pressable>

      {isOpen && (
        <View style={styles.calendar}>
          <View style={styles.header}>
            {!isChoosingYear && (
              <ArrowButton
                icon="chevron-left"
                label={STRINGS.previousMonth}
                isDisabled={!canGoToPreviousMonth(view.year, view.month, today)}
                onPress={() => handleMoveMonth(-1)}
              />
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={STRINGS.chooseYear}
              onPress={() => setIsChoosingYear((current) => !current)}
              style={({ pressed }) => [styles.title, pressed && styles.pressed]}
            >
              <Text style={styles.titleText}>
                {isChoosingYear ? STRINGS.chooseYear : `${MONTHS[view.month]} de ${view.year}`}
              </Text>
              <Icon
                name={isChoosingYear ? 'chevron-up' : 'chevron-down'}
                size={SIZE.iconSmall}
                color={COLORS.primary}
              />
            </Pressable>
            {!isChoosingYear && (
              <ArrowButton
                icon="chevron-right"
                label={STRINGS.nextMonth}
                isDisabled={!canGoToNextMonth(view.year, view.month, today)}
                onPress={() => handleMoveMonth(1)}
              />
            )}
          </View>

          {isChoosingYear ? (
            <ScrollView style={styles.years} nestedScrollEnabled>
              <View style={styles.grid}>
                {getBirthYears(today).map((year) => {
                  const isSelected = selected?.year === year;
                  return (
                    <Pressable
                      key={year}
                      accessibilityRole="button"
                      accessibilityLabel={String(year)}
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => handleSelectYear(year)}
                      style={({ pressed }) => [
                        styles.yearCell,
                        isSelected && styles.selectedCell,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.cellText, isSelected && styles.selectedText]}>
                        {year}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <>
              <View style={styles.grid}>
                {STRINGS.weekdays.map((weekday, index) => (
                  <Text key={index} style={styles.weekday}>
                    {weekday}
                  </Text>
                ))}
              </View>
              <View style={styles.grid}>
                {buildMonthCells(view.year, view.month).map((day, index) => {
                  if (day === null) {
                    return <View key={`empty-${index}`} style={styles.dayCell} />;
                  }

                  const date = { ...view, day };
                  const isDisabled = isFutureDate(date, today);
                  const isSelected = value !== '' && toIsoDate(date) === value.slice(0, 10);

                  return (
                    <Pressable
                      key={day}
                      accessibilityRole="button"
                      accessibilityLabel={formatLongDate(toIsoDate(date))}
                      accessibilityState={{ disabled: isDisabled, selected: isSelected }}
                      disabled={isDisabled}
                      onPress={() => handleSelectDay(day)}
                      style={({ pressed }) => [
                        styles.dayCell,
                        isSelected && styles.selectedCell,
                        isDisabled && styles.disabled,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.cellText, isSelected && styles.selectedText]}>
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

type ArrowButtonProps = {
  icon: IconName;
  label: string;
  isDisabled: boolean;
  onPress: () => void;
};

function ArrowButton({ icon, label, isDisabled, onPress }: ArrowButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.arrow,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Icon name={icon} size={SIZE.icon} color={COLORS.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.s6,
  },
  label: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13,
    color: COLORS.textStrong,
  },
  field: {
    height: SIZE.input,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.s14,
    backgroundColor: COLORS.inputBackground,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.field,
  },
  fieldValue: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s15,
    color: COLORS.text,
  },
  fieldPlaceholder: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s15,
    color: COLORS.textTertiary,
  },
  pressed: {
    opacity: OPACITY.pressed,
  },
  disabled: {
    opacity: OPACITY.disabled,
  },
  calendar: {
    gap: SPACING.s6,
    padding: SPACING.s10,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    borderRadius: RADIUS.field,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    width: SIZE.touchTarget,
    height: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    minHeight: SIZE.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.s6,
  },
  titleText: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s15,
    color: COLORS.textTitle,
  },
  years: {
    maxHeight: YEAR_LIST_MAX_HEIGHT,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  weekday: {
    width: DAY_CELL_WIDTH,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13,
    color: COLORS.textSecondary,
  },
  dayCell: {
    width: DAY_CELL_WIDTH,
    height: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.field,
  },
  yearCell: {
    width: YEAR_CELL_WIDTH,
    height: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.field,
  },
  selectedCell: {
    backgroundColor: COLORS.primary,
  },
  cellText: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s15,
    color: COLORS.text,
  },
  selectedText: {
    fontFamily: FONT_FAMILY.bodyBold,
    color: COLORS.onPrimary,
  },
});
