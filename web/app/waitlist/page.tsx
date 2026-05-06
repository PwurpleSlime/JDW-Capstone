'use client';

import { useState } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ChildEntry {
  firstName: string;
  lastName: string;
  dob: string;
  requestedHours: string;
  startDate: string;
  immunizationStatus: string;
}

interface FormState {
  // Parent fields
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  affiliation: string;
  // Children
  children: ChildEntry[];
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

// ─── Constants ──────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const BLANK_CHILD: ChildEntry = {
  firstName: '',
  lastName: '',
  dob: '',
  requestedHours: '',
  startDate: '',
  immunizationStatus: '',
};

const INITIAL_STATE: FormState = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  affiliation: '',
  children: [{ ...BLANK_CHILD }],
};

// ─── Small reusable input ────────────────────────────────────────────────────────
function Field({
  label,
  id,
  value,
  type = 'text',
  onChange,
  required,
}: {
  label: string;
  id: string;
  value: string;
  type?: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFB300]"
      />
    </div>
  );
}

// ─── Child sub-form ─────────────────────────────────────────────────────────────
function ChildForm({
  index,
  child,
  onUpdate,
  onRemove,
  canRemove,
}: {
  index: number;
  child: ChildEntry;
  onUpdate: (field: keyof ChildEntry, value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <fieldset className="border border-zinc-200 dark:border-zinc-700 rounded-2xl p-5 flex flex-col gap-4">
      <legend className="text-base font-semibold text-zinc-900 dark:text-white px-2">
        Child #{index + 1}
      </legend>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="First Name"
          id={`child-${index}-firstName`}
          value={child.firstName}
          onChange={(v) => onUpdate('firstName', v)}
          required
        />
        <Field
          label="Last Name"
          id={`child-${index}-lastName`}
          value={child.lastName}
          onChange={(v) => onUpdate('lastName', v)}
        />
        <Field
          label="Date of Birth"
          id={`child-${index}-dob`}
          value={child.dob}
          type="date"
          onChange={(v) => onUpdate('dob', v)}
          required
        />
        <Field
          label="Requested Hours"
          id={`child-${index}-requestedHours`}
          value={child.requestedHours}
          onChange={(v) => onUpdate('requestedHours', v)}
          required
        />
        <Field
          label="Proposed Start Date"
          id={`child-${index}-startDate`}
          value={child.startDate}
          type="date"
          onChange={(v) => onUpdate('startDate', v)}
          required
        />

        <div className="flex flex-col gap-1">
          <label
            htmlFor={`child-${index}-immunization`}
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Immunizations current?
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          </label>
          <select
            id={`child-${index}-immunization`}
            value={child.immunizationStatus}
            onChange={(e) => onUpdate('immunizationStatus', e.target.value)}
            className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFB300]"
          >
            <option value="" disabled>Select…</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Exempt">Exempt</option>
          </select>
        </div>
      </div>

      {canRemove && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onRemove}
            className="text-sm text-red-500 hover:text-red-700 underline focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
            aria-label={`Remove child ${index + 1}`}
          >
            Remove this child
          </button>
        </div>
      )}
    </fieldset>
  );
}

// ─── Waitlist Page ───────────────────────────────────────────────────────────────
export default function WaitlistPage() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // ── Parent field helpers ──────────────────────────────────────────────────
  const setParentField = (field: keyof Omit<FormState, 'children'>, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ── Child helpers ─────────────────────────────────────────────────────────
  const updateChild = (index: number, field: keyof ChildEntry, value: string) =>
    setForm((prev) => {
      const children = prev.children.map((c, i) =>
        i === index ? { ...c, [field]: value } : c,
      );
      return { ...prev, children };
    });

  const addChild = () =>
    setForm((prev) => ({ ...prev, children: [...prev.children, { ...BLANK_CHILD }] }));

  const removeChild = (index: number) =>
    setForm((prev) => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index),
    }));

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    const { firstName, phone, email, affiliation, children } = form;
    if (!firstName.trim()) return 'Parent first name is required.';
    if (!phone.trim()) return 'Parent phone is required.';
    if (!email.trim()) return 'Parent email is required.';
    if (!affiliation.trim()) return 'Affiliation is required.';
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      if (!c.firstName.trim()) return `Child ${i + 1}: first name is required.`;
      if (!c.dob) return `Child ${i + 1}: date of birth is required.`;
      if (!c.requestedHours.trim()) return `Child ${i + 1}: requested hours are required.`;
      if (!c.startDate) return `Child ${i + 1}: proposed start date is required.`;
      if (!c.immunizationStatus) return `Child ${i + 1}: immunization status is required.`;
    }
    return null;
  };

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      setSubmitStatus('error');
      return;
    }

    setSubmitStatus('submitting');
    setErrorMessage('');

    const payload = {
      parent: {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email,
        affiliation: form.affiliation,
      },
      children: form.children.map((c) => ({
        firstName: c.firstName,
        lastName: c.lastName,
        dob: c.dob,
        requestedHours: c.requestedHours,
        startDate: c.startDate,
        immunizationStatus: c.immunizationStatus,
      })),
    };

    fetch(`${API_BASE}/waitlist/add-parent-children`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((body) => {
            throw new Error(body?.message ?? `Server error ${res.status}`);
          });
        }
        return res.json();
      })
      .then(() => {
        setSubmitStatus('success');
        setForm(INITIAL_STATE);
      })
      .catch((err: Error) => {
        setErrorMessage(err.message ?? 'An unexpected error occurred. Please try again.');
        setSubmitStatus('error');
      });
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-[#FFB300] shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label="Tiger mascot">🐯</span>
          <span className="text-xl font-bold text-zinc-900 tracking-tight">
            Tiny Tigers Daycare
          </span>
        </div>
        <nav aria-label="Main navigation">
          <a
            href="/"
            className="inline-block rounded-full bg-zinc-900 text-white text-sm font-semibold px-5 py-2 hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-4 focus:ring-white"
          >
            ← Back to Home
          </a>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-2xl px-4 py-12">
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 p-8 shadow-lg">

          {/* Form heading */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">
              TINY TIGERS CHILD CARE FACILITY
            </h1>
            <p className="text-[#FFB300] font-semibold tracking-wide uppercase text-sm">
              Waitlist Form
            </p>
          </div>

          {/* Success state */}
          {submitStatus === 'success' && (
            <div
              role="alert"
              className="mb-6 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 p-4 text-center"
            >
              <p className="text-green-700 dark:text-green-300 font-semibold">
                🎉 You have been added to the waitlist! We will be in touch soon.
              </p>
              <button
                onClick={() => setSubmitStatus('idle')}
                className="mt-3 text-sm underline text-green-600 dark:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
              >
                Submit another entry
              </button>
            </div>
          )}

          {/* Error banner */}
          {submitStatus === 'error' && errorMessage && (
            <div
              role="alert"
              className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 p-4"
            >
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          {submitStatus !== 'success' && (
            <div className="flex flex-col gap-8">

              {/* ── Parent section ──────────────────────────────────────── */}
              <fieldset className="flex flex-col gap-4">
                <legend className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                  Parent / Guardian Information
                </legend>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="First Name"
                    id="parent-firstName"
                    value={form.firstName}
                    onChange={(v) => setParentField('firstName', v)}
                    required
                  />
                  <Field
                    label="Last Name"
                    id="parent-lastName"
                    value={form.lastName}
                    onChange={(v) => setParentField('lastName', v)}
                  />
                  <Field
                    label="Phone Number"
                    id="parent-phone"
                    value={form.phone}
                    type="tel"
                    onChange={(v) => setParentField('phone', v)}
                    required
                  />
                  <Field
                    label="Email Address"
                    id="parent-email"
                    value={form.email}
                    type="email"
                    onChange={(v) => setParentField('email', v)}
                    required
                  />
                </div>

                {/* Affiliation */}
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Affiliation
                    <span className="text-red-500 ml-1" aria-hidden="true">*</span>
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-6" role="radiogroup" aria-label="Affiliation">
                    {[
                      'Fort Hays Tech / NW Student',
                      'Fort Hays Tech / NW Employee',
                      'Community Member',
                    ].map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer text-sm text-zinc-700 dark:text-zinc-300">
                        <input
                          type="radio"
                          name="affiliation"
                          value={option}
                          checked={form.affiliation === option}
                          onChange={(e) => setParentField('affiliation', e.target.value)}
                          className="accent-[#FFB300]"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </fieldset>

              {/* ── Children section ─────────────────────────────────────── */}
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Children
                </h2>

                {form.children.map((child, i) => (
                  <ChildForm
                    key={i}
                    index={i}
                    child={child}
                    onUpdate={(field, value) => updateChild(i, field, value)}
                    onRemove={() => removeChild(i)}
                    canRemove={form.children.length > 1}
                  />
                ))}

                <button
                  type="button"
                  onClick={addChild}
                  className="self-start rounded-full border-2 border-[#FFB300] text-[#FFB300] font-semibold px-5 py-2 text-sm hover:bg-[#FFB300] hover:text-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFB300]"
                >
                  + Add Another Child
                </button>
              </div>

              {/* ── Submit ──────────────────────────────────────────────── */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitStatus === 'submitting'}
                  className="flex-1 rounded-full bg-[#FFB300] text-zinc-900 font-bold py-3 px-8 text-base hover:bg-[#e6a000] disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-4 focus:ring-[#FFB300]"
                  aria-busy={submitStatus === 'submitting'}
                >
                  {submitStatus === 'submitting' ? 'Submitting…' : 'Submit'}
                </button>
                <a
                  href="/"
                  className="flex-1 text-center rounded-full border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 font-semibold py-3 px-8 text-base hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-4 focus:ring-zinc-400"
                >
                  Back
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 mt-8 pb-8 text-center text-sm text-zinc-500 dark:text-zinc-500">
        © {new Date().getFullYear()} Tiny Tigers Child Care Facility — Fort Hays Tech Northwest
      </footer>
    </>
  );
}
