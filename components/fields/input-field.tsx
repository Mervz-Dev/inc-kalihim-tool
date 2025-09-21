import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import React, { useState } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { TextInput, TextInputProps } from "react-native";

export interface InputFieldProps<T extends FieldValues> extends TextInputProps {
  control: Control<T, object>;
  name: Path<T>;
  className?: string;
  focusClassName?: string;
  bottomSheetInput?: boolean;
}

export const InputField = <T extends FieldValues>({
  control,
  name,
  className,
  focusClassName,
  bottomSheetInput,
  ...props
}: InputFieldProps<T>) => {
  const [isFocused, setIsFocused] = useState(false);
  const Input = bottomSheetInput ? BottomSheetTextInput : TextInput;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <Input
          value={value}
          onChangeText={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9CA3AF"
          {...props}
          className={`rounded-xl p-4 border ${
            isFocused ? "border-blue-500" : "border-gray-300"
          } bg-white text-gray-900 text-base ${className ?? ""}`}
        />
      )}
    />
  );
};
