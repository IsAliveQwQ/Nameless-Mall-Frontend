'use client';

import * as React from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema, type LoginSchema } from '@/features/auth/schemas/auth-schema';
import { useAuth } from '@/features/auth/hooks/use-auth';

export default function AuthPage() {
    const [isLogin, setIsLogin] = React.useState(true);
    const [showPassword, setShowPassword] = React.useState(false);
    const { login, isLoginPending, register, isRegisterPending } = useAuth();

    const form = useForm<any>({
        resolver: zodResolver(isLogin ? loginSchema : registerSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    // 當切換模式時重置表單
    React.useEffect(() => {
        form.reset({
            username: '',
            password: '',
        });
    }, [isLogin, form]);

    const onSubmit = (data: any) => {
        if (isLogin) {
            login(data);
        } else {
            register(data);
        }
    };

    const isPending = isLogin ? isLoginPending : isRegisterPending;

    // Architectural Grid from prototype
    const gridStyle = {
        backgroundSize: '60px 60px',
        backgroundImage: `
            linear-gradient(to right, #E4E4E7 1px, transparent 1px),
            linear-gradient(to bottom, #E4E4E7 1px, transparent 1px)
        `,
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#FBFBFB]">
            <SiteHeader />

            {/* Main Area - Restored to Prototype logical structure */}
            <main className="flex-grow flex items-center justify-center w-full relative bg-[#FBFBFB] overflow-hidden py-12 lg:py-24">

                {/* Background Components */}
                <div className="absolute inset-0 opacity-30 pointer-events-none" style={gridStyle}></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FBFBFB]/60 to-[#FBFBFB] pointer-events-none"></div>

                {/* Outer Container matching 1440px max width */}
                <div className="relative z-10 w-full max-w-[1440px] px-6 flex justify-center">

                    {/* Auth Card - Restored exactly to 70% width / 5xl from Prototype HTML */}
                    <div className="w-full lg:w-[70%] max-w-5xl bg-white border border-[#E4E4E7] flex flex-col md:flex-row shadow-[0_4px_40px_rgba(0,0,0,0.02)] overflow-hidden">

                        {/* Left: Brand Section */}
                        <div className="relative w-full md:w-[45%] h-[320px] md:h-auto border-b md:border-b-0 md:border-r border-[#E4E4E7] overflow-hidden bg-zinc-100 group">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDWraS5-QZQ36OA-B6_usrtogltHMXMQvedRgFqGJFqDTiiTDeOr94gt_gPm1HFlZ2o4ZHOSH-1FZu7Eayn4xHBLeMYjZXHoARPovv8YUZ5sKTozYPGPKUYgWDPiqKiyil-8puvLaADX1kZsZPKN9GLLpW6IODVqdf9q0YNvzi6oQXCqGTbHVDlk7m8XmqygOyYxkavsvimyhcLVJiJ-Uk2dkWq0BPdpIm-u55cYktMOXSCj7FbTd7XoeYnQDdNKO16Y0jj5gLPfwY')" }}
                            />
                            <div className="absolute inset-0 bg-black/10"></div>

                            <div className="absolute top-10 left-10 text-white/90">
                                <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-2 text-white/80">Collection 24</p>
                                <h3 className="font-sans text-2xl font-light leading-tight tracking-wide text-white">Warm<br />Minimalism.</h3>
                            </div>

                            <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end text-white/80">
                                <div className="font-mono text-[10px] leading-relaxed">
                                    ITEM: LEATHER LOUNGE<br />
                                    FINISH: COGNAC / OAK
                                </div>
                            </div>
                        </div>

                        {/* Right: Form Section */}
                        <div className="w-full md:w-[55%] p-10 lg:p-14 flex flex-col bg-white relative min-h-[600px]">

                            {/* Tabs */}
                            <div className="flex w-full mb-10 border-b border-[#E4E4E7]">
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className={cn(
                                        "flex-1 pb-3 text-center border-b-2 transition-colors focus:outline-none",
                                        isLogin ? "border-[#18181B]" : "border-transparent hover:border-zinc-200"
                                    )}
                                >
                                    <span className={cn(
                                        "text-sm font-sans font-bold tracking-wide transition-colors",
                                        isLogin ? "text-[#18181B]" : "text-[#71717A]"
                                    )}>登入</span>
                                </button>
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className={cn(
                                        "flex-1 pb-3 text-center border-b-2 transition-colors focus:outline-none group",
                                        !isLogin ? "border-[#18181B]" : "border-transparent hover:border-zinc-200"
                                    )}
                                >
                                    <span className={cn(
                                        "text-base font-sans font-medium tracking-wide transition-colors",
                                        !isLogin ? "text-[#18181B]" : "text-[#71717A] group-hover:text-[#18181B]"
                                    )}>註冊</span>
                                </button>
                            </div>

                            {/* Welcome Text */}
                            <div className="mb-8">
                                <h1 className="font-sans text-2xl font-bold text-[#18181B] mb-2">
                                    {isLogin ? "歡迎回來" : "建立帳戶"}
                                </h1>
                                <p className="font-sans text-sm text-zinc-600 font-normal leading-relaxed">
                                    {isLogin
                                        ? "登入您的 Nameless Mall 帳戶以管理訂單與收藏清單。"
                                        : "註冊即代表同意我們的服務條款與隱私權政策。"
                                    }
                                </p>
                            </div>

                            {/* Real Authenticated Form */}
                            <form
                                key={isLogin ? 'login' : 'register'}
                                className="space-y-6 flex-grow flex flex-col justify-center"
                                onSubmit={form.handleSubmit(onSubmit)}
                            >
                                <div className="space-y-2 group">
                                    <label className="block font-mono text-xs font-medium text-[#18181B] uppercase tracking-wider" htmlFor="username">
                                        Username <span className="text-zinc-300 ml-1">///</span>
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="your_username"
                                        autoComplete="username"
                                        {...form.register('username')}
                                        className={cn(
                                            "w-full h-10 px-0 bg-transparent border-0 border-b border-[#E4E4E7] focus:border-[#18181B] focus:ring-0 placeholder:text-zinc-300 text-sm font-mono transition-colors text-[#18181B]",
                                            form.formState.errors.username && "border-red-500"
                                        )}
                                    />
                                    {form.formState.errors.username && (
                                        <p className="text-[10px] text-red-500 font-mono mt-1">
                                            {form.formState.errors.username.message as string}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2 group">
                                    <div className="flex justify-between items-center">
                                        <label className="block font-mono text-xs font-medium text-[#18181B] uppercase tracking-wider" htmlFor="password">
                                            Password <span className="text-zinc-300 ml-1">///</span>
                                        </label>
                                        {isLogin && (
                                            <Link href="#" className="text-[11px] font-mono text-[#71717A] hover:text-[#18181B] transition-colors uppercase tracking-wider">
                                                Forgot?
                                            </Link>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••••••"
                                            autoComplete={isLogin ? "current-password" : "new-password"}
                                            {...form.register('password')}
                                            className={cn(
                                                "w-full h-10 px-0 bg-transparent border-0 border-b border-[#E4E4E7] focus:border-[#18181B] focus:ring-0 placeholder:text-zinc-300 text-sm font-mono transition-colors text-[#18181B] pr-10",
                                                form.formState.errors.password && "border-red-500"
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#18181B] transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </button>
                                    </div>
                                    {form.formState.errors.password && (
                                        <p className="text-[10px] text-red-500 font-mono mt-1">
                                            {form.formState.errors.password.message as string}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-6 space-y-4 mt-auto">
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="w-full bg-[#18181B] hover:bg-[#27272A] disabled:bg-[#3F3F46] text-white rounded-md transition-all flex items-center justify-center py-4 px-6 shadow-sm active:scale-[0.99]"
                                    >
                                        {isPending ? (
                                            <Loader2 className="size-4 animate-spin mr-2" />
                                        ) : null}
                                        <span className="text-sm font-sans font-medium tracking-wide">
                                            {isPending ? "處理中..." : (isLogin ? "登入帳戶" : "註冊會員")}
                                        </span>
                                    </button>

                                    <div className="relative flex items-center py-2">
                                        <div className="flex-grow border-t border-[#E4E4E7]"></div>
                                        <span className="flex-shrink-0 mx-4 text-xs font-mono text-zinc-400 uppercase tracking-widest">Or continue with</span>
                                        <div className="flex-grow border-t border-[#E4E4E7]"></div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const authUrl = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL || 'https://isaliveqwq.me/oauth2/authorization/google';
                                            console.log('[OAuth2] Redirecting to:', authUrl);
                                            window.location.href = authUrl;
                                        }}
                                        className="w-full h-11 bg-white border border-[#E4E4E7] hover:bg-zinc-50 hover:border-zinc-300 text-[#18181B] rounded-md transition-all duration-200 flex items-center justify-center gap-3 group active:scale-[0.99]"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                        </svg>
                                        <span className="text-sm font-sans font-medium text-[#18181B]">Google 登入</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
