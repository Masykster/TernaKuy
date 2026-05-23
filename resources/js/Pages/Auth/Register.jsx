import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import indonesiaData from '@/data/indonesiaData';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
        province: '',
        city: '',
    });

    const provinces = useMemo(() => Object.keys(indonesiaData).sort(), []);
    const cities = useMemo(() => {
        if (!data.province || !indonesiaData[data.province]) return [];
        return indonesiaData[data.province];
    }, [data.province]);

    const handleProvinceChange = (e) => {
        setData((prev) => ({
            ...prev,
            province: e.target.value,
            city: '', // Reset city when province changes
        }));
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Daftar" />

            <h2 className="auth-title">Buat Akun Baru 🐔</h2>
            <p className="auth-subtitle">Daftar untuk mulai mengelola peternakan kamu</p>

            <form onSubmit={submit}>
                {/* Nama Lengkap */}
                <div className="auth-field">
                    <label htmlFor="register-name" className="auth-label">
                        Nama Lengkap
                    </label>
                    <input
                        id="register-name"
                        type="text"
                        name="name"
                        value={data.name}
                        className="auth-input"
                        placeholder="Masukkan nama lengkap"
                        autoComplete="name"
                        autoFocus
                        required
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    <InputError message={errors.name} className="auth-error" />
                </div>

                {/* Nomor HP */}
                <div className="auth-field">
                    <label htmlFor="register-phone" className="auth-label">
                        Nomor HP
                    </label>
                    <input
                        id="register-phone"
                        type="tel"
                        name="phone"
                        value={data.phone}
                        className="auth-input"
                        placeholder="08xxxxxxxxxx"
                        autoComplete="tel"
                        onChange={(e) => setData('phone', e.target.value)}
                    />
                    <InputError message={errors.phone} className="auth-error" />
                </div>

                {/* Email */}
                <div className="auth-field">
                    <label htmlFor="register-email" className="auth-label">
                        Email
                    </label>
                    <input
                        id="register-email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="auth-input"
                        placeholder="contoh@email.com"
                        autoComplete="username"
                        required
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="auth-error" />
                </div>

                {/* Provinsi */}
                <div className="auth-field">
                    <label htmlFor="register-province" className="auth-label">
                        Provinsi
                    </label>
                    <select
                        id="register-province"
                        name="province"
                        value={data.province}
                        className="auth-input auth-select"
                        onChange={handleProvinceChange}
                    >
                        <option value="">Pilih Provinsi</option>
                        {provinces.map((prov) => (
                            <option key={prov} value={prov}>
                                {prov}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.province} className="auth-error" />
                </div>

                {/* Kota */}
                <div className="auth-field">
                    <label htmlFor="register-city" className="auth-label">
                        Kota / Kabupaten
                    </label>
                    <select
                        id="register-city"
                        name="city"
                        value={data.city}
                        className="auth-input auth-select"
                        onChange={(e) => setData('city', e.target.value)}
                        disabled={!data.province}
                    >
                        <option value="">
                            {data.province ? 'Pilih Kota' : 'Pilih provinsi dulu'}
                        </option>
                        {cities.map((city) => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.city} className="auth-error" />
                </div>

                {/* Password */}
                <div className="auth-field">
                    <label htmlFor="register-password" className="auth-label">
                        Kata Sandi
                    </label>
                    <input
                        id="register-password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="auth-input"
                        placeholder="Minimal 8 karakter"
                        autoComplete="new-password"
                        required
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="auth-error" />
                </div>

                {/* Konfirmasi Password */}
                <div className="auth-field">
                    <label htmlFor="register-password-confirm" className="auth-label">
                        Konfirmasi Kata Sandi
                    </label>
                    <input
                        id="register-password-confirm"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="auth-input"
                        placeholder="Ulangi kata sandi"
                        autoComplete="new-password"
                        required
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                    />
                    <InputError
                        message={errors.password_confirmation}
                        className="auth-error"
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="auth-btn-primary"
                    disabled={processing}
                >
                    {processing ? 'Memproses...' : 'Daftar'}
                </button>

                {/* Login Link */}
                <p className="auth-bottom-text">
                    Sudah punya akun?{' '}
                    <Link href={route('login')} className="auth-link-bold">
                        Masuk
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
