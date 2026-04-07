// Logic Login & Logout

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Ambil input
            const usernameInput = document.getElementById('username').value.trim();
            const passwordInput = document.getElementById('password').value.trim();
            const roleInput = document.querySelector('input[name="role"]:checked').value; // 'student' atau 'admin'

            // Tukar butang kepada mod loading
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="relative flex items-center tracking-widest"><i class="fas fa-spinner fa-spin mt-0.5 mr-2"></i> Mengesahkan...</span>';
            submitBtn.disabled = true;

            try {
                if (roleInput === 'admin') {
                    // Admin uses Legacy Custom DB Login (jadual users)
                    const { data, error } = await supabaseClient
                        .from('users')
                        .select('id, username, role, remarks')
                        .eq('username', usernameInput)
                        .eq('password', passwordInput)
                        .single();

                    if (error || !data) throw new Error("Akses Pentadbir Ditolak");

                    localStorage.setItem('userSession', JSON.stringify({
                        id: data.id,
                        username: data.username,
                        role: data.role,
                        remarks: data.remarks
                    }));
                    window.location.href = 'dashboard-admin.html';
                } else {
                    // Student uses Modern Supabase.Auth (Email + Password)
                    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
                        email: usernameInput,
                        password: passwordInput,
                    });

                    if (authError || !authData.user) {
                        throw new Error("E-mel atau Kata Laluan salah.");
                    }

                    // Map Auth metadata to Local Storage for backward compatibility
                    const studentId = authData.user.user_metadata?.id_ahli || 'TIDAK_DIJUMPAI';
                    const userSession = {
                        id: authData.user.id,
                        username: studentId,
                        role: 'student'
                    };
                    
                    localStorage.setItem('userSession', JSON.stringify(userSession));
                    window.location.href = 'dashboard-student.html';
                }

            } catch (err) {
                // Error Feedback
                const errorMsg = document.getElementById('error-message');
                if (errorMsg) {
                    errorMsg.innerHTML = `<i class="fas fa-exclamation-triangle text-xs"></i> <span>${err.message || 'Ralat Pengesahan'}</span>`;
                    errorMsg.classList.remove('hidden');
                    errorMsg.classList.add('flex');
                }

                const inputs = document.querySelectorAll('.premium-input');
                inputs.forEach(input => {
                    input.classList.remove('focus:border-gold', 'focus:ring-gold', 'border-white/10');
                    input.classList.add('border-red-500/50', 'focus:border-red-500', 'focus:ring-red-500', 'is-invalid');
                });
            } finally {
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            }
        });
    }

    // REGISTRATION LOGIC
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errDiv = document.getElementById('reg-error');
            errDiv.classList.add('hidden');
            
            const reqId = document.getElementById('reg-id').value.trim();
            const reqIc = document.getElementById('reg-ic').value.trim();
            const reqEmail = document.getElementById('reg-email').value.trim();
            const reqPass = document.getElementById('reg-password').value;
            const confirmPass = document.getElementById('reg-confirm-password').value;

            if (reqPass !== confirmPass) {
                errDiv.innerText = "Sila pastikan Kata Laluan dan Sahkan Kata Laluan adalah sepadan.";
                errDiv.classList.remove('hidden');
                return;
            }

            const btn = document.getElementById('btnRegSubmit');
            const ogText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Semak Data...';
            btn.disabled = true;

            try {
                // STEP 1: Verify exact IC and ID match in 'ahli' table
                const { data: matchedAhli, error: matchErr } = await supabaseClient
                    .from('ahli')
                    .select('id_ahli, ic')
                    .eq('id_ahli', reqId)
                    .eq('ic', reqIc)
                    .single();

                if (matchErr || !matchedAhli) {
                    throw new Error("ID Pesilat dan No. Kad Pengenalan tidak berpadanan dalam cawangan kami.");
                }

                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Daftar E-mel...';

                // STEP 2: Initiate Supabase Auth SignUp and inject id_ahli metadata
                const { data: signUpData, error: signUpErr } = await supabaseClient.auth.signUp({
                    email: reqEmail,
                    password: reqPass,
                    options: {
                        data: {
                            id_ahli: reqId,
                            role: 'student'
                        }
                    }
                });

                if (signUpErr) {
                    if (signUpErr.message.includes('already registered')) throw new Error("E-mel ini telah pun didaftarkan.");
                    throw new Error(signUpErr.message);
                }

                alert("Pendaftaran Berjaya! Anda kini boleh Log Masuk menggunakan E-mel.");
                window.closeRegisterModal();
                registerForm.reset();

            } catch(e) {
                errDiv.innerText = e.message;
                errDiv.classList.remove('hidden');
            } finally {
                btn.innerHTML = ogText;
                btn.disabled = false;
            }
        });
    }

    // FORGOT PASSWORD LOGIC
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const reqEmail = document.getElementById('forgot-email').value.trim();
            
            const errDiv = document.getElementById('forgot-error');
            const sucDiv = document.getElementById('forgot-success');
            errDiv.classList.add('hidden');
            sucDiv.classList.add('hidden');

            const btn = document.getElementById('btnForgotSubmit');
            const ogText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            btn.disabled = true;

            try {
                // Always redirect to the production reset page
                const resetRedirectUrl = 'https://silatdaengkuning.vercel.app/reset-password.html';
                
                const { error } = await supabaseClient.auth.resetPasswordForEmail(reqEmail, {
                    redirectTo: resetRedirectUrl,
                });

                if (error) throw error;
                
                sucDiv.classList.remove('hidden');
                document.getElementById('forgot-email').value = '';

                // Enable resend button with cooldown
                const resendBtn = document.getElementById('btnResendForgot');
                if (resendBtn) {
                    let countdown = 60;
                    resendBtn.disabled = true;
                    resendBtn.innerHTML = `<i class="fas fa-clock text-[9px]"></i> Hantar semula dalam ${countdown}s`;
                    const timer = setInterval(() => {
                        countdown--;
                        resendBtn.innerHTML = `<i class="fas fa-clock text-[9px]"></i> Hantar semula dalam ${countdown}s`;
                        if (countdown <= 0) {
                            clearInterval(timer);
                            resendBtn.disabled = false;
                            resendBtn.innerHTML = `<i class="fas fa-paper-plane text-[9px]"></i> Hantar Semula E-mel`;
                        }
                    }, 1000);

                    resendBtn.onclick = async () => {
                        const emailVal = resendBtn.closest('form')?.querySelector('#forgot-email')?.value ||
                                         document.getElementById('forgot-email').value;
                        // Re-read email from a data attribute we'll store
                        const lastEmail = resendBtn.dataset.lastEmail;
                        if (!lastEmail) return;
                        resendBtn.disabled = true;
                        resendBtn.innerHTML = `<i class="fas fa-spinner fa-spin text-[9px]"></i> Menghantar...`;
                        await supabaseClient.auth.resetPasswordForEmail(lastEmail, {
                            redirectTo: 'https://silatdaengkuning.vercel.app/reset-password.html'
                        });
                        resendBtn.innerHTML = `<i class="fas fa-check text-[9px]"></i> E-mel dihantar!`;
                        setTimeout(() => {
                            resendBtn.innerHTML = `<i class="fas fa-paper-plane text-[9px]"></i> Hantar Semula E-mel`;
                        }, 3000);
                    };
                    // Store the email for resend use
                    resendBtn.dataset.lastEmail = reqEmail;
                }

            } catch(e) {
                errDiv.innerText = "Gagal memproses e-mel. Pastikan e-mel sah.";
                errDiv.classList.remove('hidden');
            } finally {
                btn.innerHTML = ogText;
                btn.disabled = false;
            }
        });
    }

    // Auto-redirect jika sudah log masuk tetapi berada di page login
    if (window.location.pathname.includes('login.html')) {
        const session = localStorage.getItem('userSession');
        if (session) {
            const user = JSON.parse(session);
            if (user.role === 'admin' || user.role === 'superadmin') {
                window.location.replace('dashboard-admin.html');
            } else if (user.role === 'student') {
                window.location.replace('dashboard-student.html');
            }
        }
    }
});

// 5. Security Guard - Logout Function
function logout() {
    localStorage.removeItem('userSession');
    window.location.href = 'index.html';
}

// 6. Universal Auth Guards
function checkStudentAuth() {
    const sessionStr = localStorage.getItem('userSession');
    if (!sessionStr) {
        alert('Akses Ditolak! Sila log masuk terlebih dahulu.');
        window.location.replace('login.html');
        return false;
    }
    try {
        const user = JSON.parse(sessionStr);
        if (user.role !== 'student') {
            alert('Akses Ditolak! Laman ini khusus untuk pesilat sahaja.');
            window.location.replace('login.html');
            return false;
        }
        return true;
    } catch (e) {
        window.location.replace('login.html');
        return false;
    }
}
