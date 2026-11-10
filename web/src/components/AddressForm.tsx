import { Button, CloseButton, TextInput } from '@mantine/core';
import { type FormEvent, useEffect, useState } from 'react';

interface AddressFormProps {
  /** The address last looked up. The field follows it, e.g. when a suggestion is picked. */
  address: string;
  loading: boolean;
  onSubmit: (address: string) => void;
  /** Forget the address and clear the result. */
  onClear: () => void;
}

export function AddressForm({ address, loading, onSubmit, onClear }: AddressFormProps) {
  const [value, setValue] = useState(address);
  useEffect(() => setValue(address), [address]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  };

  return (
    <form className="address-form" onSubmit={submit}>
      <PinIcon />
      <TextInput
        className="address-input"
        variant="unstyled"
        size="lg"
        name="address"
        aria-label="Your address"
        placeholder="e.g. 12 Smith Street, Suburb NSW"
        autoComplete="street-address"
        enterKeyHint="search"
        spellCheck={false}
        autoCorrect="off"
        required
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        rightSection={
          value && (
            <CloseButton
              aria-label="Clear address"
              onClick={() => {
                setValue('');
                onClear();
              }}
            />
          )
        }
      />
      <Button type="submit" size="md" radius="xl" loading={loading}>
        Find my bins
      </Button>
    </form>
  );
}

function PinIcon() {
  return (
    <svg className="address-pin" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}
