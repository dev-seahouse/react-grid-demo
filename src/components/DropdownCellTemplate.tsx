import * as React from "react";
import { getCellProperty } from "@silevis/reactgrid";
import Select, {
  OptionProps,
  MenuProps,
  CSSObjectWithLabel,
} from "react-select";
import {
  type Cell,
  type CellTemplate,
  type Compatible,
  type Uncertain,
  type UncertainCompatible,
} from "@silevis/reactgrid";

export interface OptionType {
  label: string;
  value: string;
  isDisabled?: boolean;
}

export interface DropdownCell extends Cell {
  type: "dropdown";
  selectedValue?: string;
  values: OptionType[];
  isDisabled?: boolean;
  isOpen?: boolean;
  inputValue?: string;
  styles?: {
    container?: CSSObjectWithLabel;
    control?: CSSObjectWithLabel;
    indicatorsContainer?: CSSObjectWithLabel;
    dropdownIndicator?: CSSObjectWithLabel;
    singleValue?: CSSObjectWithLabel;
    indicatorSeparator?: CSSObjectWithLabel;
    input?: CSSObjectWithLabel;
    valueContainer?: CSSObjectWithLabel;
  };
}

interface DIProps {
  onCellChanged: (...args: any[]) => void;
  cell: Record<string, any>;
}

const DropdownInput: React.FC<DIProps> = ({ onCellChanged, cell }) => {
  const selectRef = React.useRef<any>(null);
  const [inputValue, setInputValue] = React.useState<string | undefined>(
    cell.inputValue
  );

  const selectedValue = React.useMemo<OptionType | undefined>(
    () => cell.values.find((val: any) => val.value === cell.text),
    [cell.text, cell.values]
  );

  React.useEffect(() => {
    if (cell.isOpen && selectRef.current) {
      selectRef.current.focus();
      setInputValue(cell.inputValue);
    }
  }, [cell.isOpen, cell.inputValue]);

  return (
    <div
      style={{ width: "100%" }}
      onPointerDown={() => onCellChanged({ ...cell, isOpen: true })}
    >
      <Select
        {...(cell.inputValue && {
          inputValue,
          defaultInputValue: inputValue,
          onInputChange: (e) => setInputValue(e),
        })}
        isSearchable={true}
        ref={selectRef}
        {...(cell.isOpen !== undefined && { menuIsOpen: cell.isOpen })}
        onMenuClose={() =>
          onCellChanged({
            ...cell,
            isOpen: !cell.isOpen,
            inputValue: undefined,
          })
        }
        onMenuOpen={() => onCellChanged({ ...cell, isOpen: true })}
        onChange={(e) =>
          onCellChanged({
            ...cell,
            selectedValue: (e as OptionType).value,
            isOpen: false,
            inputValue: undefined,
          })
        }
        blurInputOnSelect={true}
        defaultValue={selectedValue}
        value={selectedValue !== undefined ? selectedValue : null}
        isDisabled={cell.isDisabled}
        options={cell.values}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Escape") {
            selectRef.current.blur();
            return onCellChanged({
              ...cell,
              isOpen: false,
              inputValue: undefined,
            });
          }
        }}
        components={{
          Option: CustomOption,
          Menu: CustomMenu,
        }}
        styles={{
          container: (provided) => ({
            ...provided,
            width: "100%",
            height: "100%",
          }),
          control: (provided) => ({
            ...provided,
            minHeight: "32px",
            height: "32px",
            backgroundColor: "transparent",
            border: "none",
            borderRadius: "0",
            boxShadow: "none",
            cursor: "pointer",
            "&:hover": {
              border: "none",
            },
          }),
          placeholder: (provided) => ({
            ...provided,
            color: "rgba(0, 0, 0, 0.25)",
          }),
          indicatorsContainer: (provided) => ({
            ...provided,
            height: "32px",
          }),
          dropdownIndicator: (provided) => ({
            ...provided,
            padding: "4px 8px",
            color: "#bfbfbf",
            height: "32px",
          }),
          singleValue: (provided) => ({
            ...provided,
            color: "rgba(0, 0, 0, 0.88)",
            margin: "0",
            padding: "0 8px",
          }),
          input: (provided) => ({
            ...provided,
            margin: "0",
            padding: "0 8px",
          }),
          valueContainer: (provided) => ({
            ...provided,
            padding: "0",
            height: "32px",
          }),
          menu: (provided) => ({
            ...provided,
            marginTop: "4px",
            backgroundColor: "white",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            borderRadius: "2px",
          }),
          option: (provided, state) => ({
            ...provided,
            padding: "5px 12px",
            backgroundColor: state.isSelected
              ? "#e6f4ff"
              : state.isFocused
              ? "#f5f5f5"
              : "white",
            color: state.isSelected ? "#1677ff" : "rgba(0, 0, 0, 0.88)",
            cursor: "pointer",
            fontSize: "14px",
            lineHeight: "22px",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }),
        }}
      />
    </div>
  );
};

const CustomOption: React.FC<OptionProps<OptionType, false>> = ({
  innerProps,
  label,
  isSelected,
  isFocused,
  isDisabled,
}) => (
  <div
    {...innerProps}
    onPointerDown={(e) => e.stopPropagation()}
    className={`rg-dropdown-option${isSelected ? " selected" : ""}${
      isFocused ? " focused" : ""
    }${isDisabled ? " disabled" : ""}`}
  >
    {label}
  </div>
);

const CustomMenu: React.FC<MenuProps<OptionType, false>> = ({
  innerProps,
  children,
}) => (
  <div
    {...innerProps}
    className="rg-dropdown-menu"
    onPointerDown={(e) => e.stopPropagation()}
  >
    {children}
  </div>
);

export class DropdownCellTemplate implements CellTemplate<DropdownCell> {
  getCompatibleCell(
    uncertainCell: Uncertain<DropdownCell>
  ): Compatible<DropdownCell> {
    let selectedValue: string | undefined;

    try {
      selectedValue = getCellProperty(uncertainCell, "selectedValue", "string");
    } catch {
      selectedValue = undefined;
    }

    const values = getCellProperty(uncertainCell, "values", "object");
    const value = selectedValue ? parseFloat(selectedValue) : NaN;

    let isDisabled = true;
    try {
      isDisabled = getCellProperty(uncertainCell, "isDisabled", "boolean");
    } catch {
      isDisabled = false;
    }

    let inputValue: string | undefined;
    try {
      inputValue = getCellProperty(uncertainCell, "inputValue", "string");
    } catch {
      inputValue = undefined;
    }

    let isOpen: boolean;
    try {
      isOpen = getCellProperty(uncertainCell, "isOpen", "boolean");
    } catch {
      isOpen = false;
    }

    const text = selectedValue || "";

    return {
      ...uncertainCell,
      selectedValue,
      text,
      value,
      values,
      isDisabled,
      isOpen,
      inputValue,
    };
  }

  update(
    cell: Compatible<DropdownCell>,
    cellToMerge: UncertainCompatible<DropdownCell>
  ): Compatible<DropdownCell> {
    const selectedValueFromText = cell.values.some(
      (val: any) => val.value === cellToMerge.text
    )
      ? cellToMerge.text
      : undefined;

    return this.getCompatibleCell({
      ...cell,
      selectedValue: selectedValueFromText,
      isOpen: cellToMerge.isOpen,
      inputValue: cellToMerge.inputValue,
    });
  }

  getClassName(cell: Compatible<DropdownCell>, isInEditMode: boolean): string {
    const isOpen = cell.isOpen ? "open" : "closed";
    return `${cell.className ? cell.className : ""}${isOpen}`;
  }

  handleKeyDown(
    cell: Compatible<DropdownCell>,
    keyCode: number,
    ctrl: boolean,
    shift: boolean,
    alt: boolean,
    key: string,
    capsLock: boolean
  ): { cell: Compatible<DropdownCell>; enableEditMode: boolean } {
    if ((keyCode === 32 || keyCode === 13) && !shift) {
      return {
        cell: this.getCompatibleCell({ ...cell, isOpen: !cell.isOpen }),
        enableEditMode: false,
      };
    }

    if (!ctrl && !alt && !(shift && keyCode === 32)) {
      return {
        cell: this.getCompatibleCell({
          ...cell,
          inputValue: key,
          isOpen: !cell.isOpen,
        }),
        enableEditMode: false,
      };
    }

    return { cell, enableEditMode: false };
  }

  handleCompositionEnd(
    cell: Compatible<DropdownCell>,
    eventData: any
  ): { cell: Compatible<DropdownCell>; enableEditMode: boolean } {
    return {
      cell: { ...cell, inputValue: eventData, isOpen: !cell.isOpen },
      enableEditMode: false,
    };
  }

  render(
    cell: Compatible<DropdownCell>,
    isInEditMode: boolean,
    onCellChanged: (cell: Compatible<DropdownCell>, commit: boolean) => void
  ): React.ReactNode {
    return (
      <DropdownInput
        onCellChanged={(cell) =>
          onCellChanged(this.getCompatibleCell(cell), true)
        }
        cell={cell}
      />
    );
  }
}
