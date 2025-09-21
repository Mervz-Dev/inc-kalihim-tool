import React, { JSX } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Dropdown } from "../dropdown";

export interface DropdownOption {
  label: string;
  value: string | number;
  leftItem?: JSX.Element;
}

export interface DropdownFieldProps<T extends FieldValues> {
  control: Control<T, object>;
  name: Path<T>;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  focusClassName?: string;
}

export const DropdownField = <T extends FieldValues>({
  control,
  name,
  options,
  placeholder,
  className,
}: DropdownFieldProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        const selectedValue = options.find((o) => o.value === value);

        return (
          <Dropdown
            className={className}
            placeholder={placeholder}
            value={selectedValue?.value}
            onChange={onChange}
            options={options}
          />
        );
      }}
    />
  );
};
