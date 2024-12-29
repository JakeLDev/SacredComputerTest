'use client';

import * as React from 'react';
import ReactDOM from 'react-dom';
import styles from '@components/Dropdown.module.scss';
import OutsideElementEvent from '@components/detectors/OutsideElementEvent';

interface DropdownProps {
  name: string;
  options: string[];
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

/* TODO
- Fix open upwards
- Allow easy customization of styles? especially width
- Allow single or multi selection (with prop)
- Allow searching? Might be worth to make a separate component for this
   - Is search, "search" or "filter"?
*/

const Dropdown: React.FC<DropdownProps> = ({
  name,
  options,
  defaultValue,
  placeholder = 'Select an option',
  onChange
}) => {
  const [selectedValue, setSelectedValue] = React.useState(defaultValue || '');
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownRect, setDropdownRect] = React.useState<DOMRect | null>(null);
  const [openUpwards, setOpenUpwards] = React.useState(false);

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    setIsOpen(false);
    onChange?.(value);
  };

  const onOutsideEvent = (e: MouseEvent) => {
    if (headerRef.current && headerRef.current.contains(e.target as Node)) {
      return;
    }
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!isOpen && headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      setDropdownRect(rect);

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // TODO Jake, fix this to open upwards if there's not enough space below
      // also open down if there's not enough space above and below

      if (spaceBelow < 200 && spaceAbove > spaceBelow) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div ref={dropdownRef} className={styles.customDropdown}>
        <div
          ref={headerRef}
          className={styles.dropdownHeader}
          onClick={handleToggle}
        >
          {selectedValue || placeholder}
          <span className={`${styles.dropdownArrow} ${isOpen ? styles.arrowUp : ''}`}>▼</span>
        </div>
      </div>

      {isOpen && dropdownRect &&
        ReactDOM.createPortal(
          <OutsideElementEvent onOutsideEvent={onOutsideEvent}>
            <div
              className={styles.dropdownList}
              style={{
                position: 'absolute',
                top: openUpwards ? dropdownRect.top + window.scrollY - 200 : dropdownRect.bottom + window.scrollY,
                left: dropdownRect.left + window.scrollX,
                width: dropdownRect.width
              }}
            >
              {options.map((option, index) => (
                <div
                  key={index}
                  className={styles.dropdownItem}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </div>
              ))}
            </div>
          </OutsideElementEvent>,
          document.body
        )}
    </>
  );
};

export default Dropdown;