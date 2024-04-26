import { launch } from './Componants/Pong.js'
import { mySocket } from './Componants/Pong.js';
const urlPageTitle = "Transcendence";

console.log(document.body)

document.addEventListener("click", (e) => {
    const { target } = e;
    if (!target.matches("a")) {
        return;
    }
    e.preventDefault();
    urlRoute();
});

const urlRoutes = {
    404: {
        template: "static/Client/Pages/404.html",
        title: "404 | " + urlPageTitle,
        description: "Page not found",
    },
    "/": {
        template: "static/Client/Pages/home.html",
        title: "Home | " + urlPageTitle,
        description: "This is the home page",
    },
    "/home": {
        template: "static/Client/Pages/home.html",
        title: "Home | " + urlPageTitle,
        description: "This is the home page",
    },
    "/login": {
        template: "static/Client/Pages/login.html",
        title: "Login | " + urlPageTitle,
        description: "This is the login page",
    },
    "/register": {
        template: "static/Client/Pages/register.html",
        title: "Register | " + urlPageTitle,
        description: "This is the register page",
    },
    "/account": {
        template: "static/Client/Pages/account.html",
        title: "Logged In | " + urlPageTitle,
        description: "This is the authenticated page",
    },
    "/settings": {
        template: "static/Client/Pages/settings.html",
        title: "Settings | " + urlPageTitle,
        description: "This is the settings page",
    },
    "/about": {
        template: "static/Client/Pages/about.html",
        title: "About Us | " + urlPageTitle,
        description: "This is the about page",
    },
    "/game": {
        template: "static/Client/Pages/game.html",
        title: "Game | " + urlPageTitle,
        description: "This is the game page",
    },
    "/api/login": {
    },
    "/api/register": {
    },
    "/api/user": {
    },
    "/api/logout": {
    },
    "/api/delete_user": {
    },
	"/api/update_user":{
	},
	"/api/update_avatar": {
	},
	"/api/callback": {
	},
	"/api/add_friends": {
	},
	"/api/friends_list": {
	},
	"/api/get_intra_link": {
	},
	"/api/generate_otp": {
	},
	"/api/verify_otp": {
	},
	"/api/disable_otp": {
	},
	"/api/update_match": {
	},
	"/api/update_online_status": {
	},
    "/callback": {
    },
};

const urlRoute = (event) => {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, "", event.target.href);
    urlLocationHandler();
};

let currentScript = null;

const checkAuth = async (location) => {
    const token = sessionStorage.getItem("token");
    console.log("token: ", token);
    const authenticatedRoutes = ["/account", "/game", "/settings"];
    const nonRestrictedRoutes = ["/about", "/home", "/"];
    const isAuthRoute = authenticatedRoutes.includes(location);
    const isNonRestrictedRoute = nonRestrictedRoutes.includes(location);

    if (!token && isAuthRoute) {
        window.location.href = "/login";
    } else if (token && !isAuthRoute && !isNonRestrictedRoute) {
        window.location.href = "/account";
    }
};

const urlLocationHandler = async () => {

    if (currentScript && currentScript.parentNode) {
        currentScript.parentNode.removeChild(currentScript);
        currentScript = null;
    }

    let location = window.location.pathname;
    if (location.length == 0) {
        location = "/";
    }
    const route = urlRoutes[location] || urlRoutes["404"];
    const html = await fetch(route.template).then((response) => response.text());
    document.getElementById("content").innerHTML = html;

    await checkAuth(location);

    if (location === '/game') {
        // Check if the pongCanvas element exists
        const pongCanvas = document.getElementById('content');

        if (pongCanvas) {
            // Create a new script element
            currentScript = document.createElement('script');
            launch();
        }
    }
    
	if (location === '/register') {
		const registerForm = document.getElementById("register-form");
		if (registerForm) {
			registerForm.addEventListener("submit", async (e) => {
				e.preventDefault();
				const formData = new FormData(registerForm);
				const username = formData.get("username");
				const email = formData.get("email");
				const password = formData.get("password");
				const password_confirmation = formData.get("password_confirmation");
	
				try {
					const response = await fetch("/api/register/", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ username, email, password, password_confirmation }),
					});
	
					if (!response.ok) {
						switch (response.status) {
							case 400:
								const responseData = await response.json();
								console.log(responseData); // Log the response data to see if the error message is received
								
								// Initialize an empty array to store all error message elements
								const errorElements = [];
								// Iterate over each field in the response data
								for (const field in responseData) {
									// Check if the field is 'password'
									if (field === 'password') {
										// Extract password errors
										const passwordErrors = responseData[field][0].replace(/[\[\]']+/g, '').split(', ');
										// Create a separate error element for each password error
										passwordErrors.forEach(errorMessage => {
											const errorElement = document.createElement('div');
											errorElement.textContent = errorMessage;
											// Add error class to style error messages if needed
											errorElement.classList.add('error');
											// Append the error element to the array
											errorElements.push(errorElement);
										});
									} else {
										// Extract error messages for other fields
										const fieldErrors = responseData[field];
										// Create a separate error element for each error message
										fieldErrors.forEach(errorMessage => {
											const errorElement = document.createElement('div');
											errorElement.textContent = errorMessage;
											// Add error class to style error messages if needed
											errorElement.classList.add('error');
											// Append the error element to the array
											errorElements.push(errorElement);
										});
									}
								}
							
								// Clear existing content of the error container
								const errorContainer = document.querySelector('#register-error');
								errorContainer.innerHTML = '';
							
								// Append each error element to the error container
								errorElements.forEach(errorElement => {
									errorContainer.appendChild(errorElement);
								});
								break;
							case 500:
								errorContainer.textContent = 'Server error';
								break;
							default:
								errorContainer.textContent = 'Registration error: Status code ' + response.status;
						}
					} else {
						const data = await response.json();
						window.location.href = "/login";
					}
				} catch (error) {
					console.error("Registration error (catch):", error);
				}
			});
		}
	}

	if (location === '/login') {
		const loginForm = document.getElementById("login-form");
		if (loginForm) {
			loginForm.addEventListener("submit", async (e) => {
				e.preventDefault();
				const formData = new FormData(loginForm);
				const username = formData.get("username");
				const password = formData.get("password");
	
				try {
					const response = await fetch("/api/login/", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ username, password }),
					});
	
					if (!response.ok) {
						const responseData = await response.json();	
						const errorContainer = document.querySelector('#login-error');
						errorContainer.innerHTML = '';
	
						if (response.status === 400 && responseData.message == "OTP required") {
							const otpContainer = document.getElementById("otp-container");
							otpContainer.innerHTML = '';

							const otpForm = document.createElement("div");
							otpForm.innerHTML = `
								<form>
									<input type="text" id="otp-code" name="otp-code" placeholder="OTP Code">
									<button type="submit">Submit</button>
								</form>
							`;
							otpContainer.appendChild(otpForm);

							otpForm.addEventListener("submit", async (e) => {
								e.preventDefault();
								const otpCode = otpForm.querySelector("#otp-code").value;
								try {
									const response = await fetch("/api/login/", {
										method: "POST",
										headers: {
											"Content-Type": "application/json",
										},
										body: JSON.stringify({ username, password, otpCode }),
									});
									if (!response.ok) {
										const responseData = await response.json();
										console.log(responseData);
										const errorContainer = document.querySelector('#login-error');
										errorContainer.innerHTML = '';
										if (Array.isArray(responseData)) {
											responseData.forEach(errorMessage => {
												const errorElement = document.createElement('div');
												errorElement.textContent = errorMessage;
												errorElement.classList.add('error');
												errorContainer.appendChild(errorElement);
											});
										} else {
											const errorMessage = responseData.detail;
											const errorElement = document.createElement('div');
											errorElement.textContent = errorMessage;
											errorElement.classList.add('error');
											errorContainer.appendChild(errorElement);
										}
									} else {
										const data = await response.json();
										sessionStorage.setItem("token", data.token);
										window.location.href = "/account";
									}
								} catch (error) {
									console.error("Verify OTP error:", error);
								}
							});
						} else {
							const errorMessage = responseData.detail || 'Invalid username or password';
							const errorElement = document.createElement('div');
							errorElement.textContent = errorMessage;
							errorElement.classList.add('error');
							errorContainer.appendChild(errorElement);
							throw new Error("Failed to login");
						}
					} else {
						const data = await response.json();
						sessionStorage.setItem("token", data.token);
						window.location.href = "/account";
					}
				} catch (error) {
					console.error("Login error:", error);
				}
			});
		}

		const intraLoginButton = document.getElementById("intra-login-button");
		if (intraLoginButton) {
   			intraLoginButton.addEventListener("click", async (e) => {
        		e.preventDefault();
				try {
					const response = await fetch("/api/get_intra_link/", {
						method: "GET",
					});
					console.log(response);
					if (!response.ok) {
						console.error("Failed to login with intra");
						throw new Error("Failed to login with intra");
					} else {
						const data = await response.json();
						console.log(data);
						window.location.href = data.intra_link;
					}
				} catch (error) {
					console.error("Login with intra error:", error);
				}			
			});
		}

        const logoutButton = document.getElementById("logout-button");
        if (logoutButton) {
            logoutButton.addEventListener("click", async () => {
                try {
                    const response = await fetch("/api/logout/", {
                        method: "POST",
                    });
                    if (response.ok) {
                        sessionStorage.removeItem("token");
                        window.location.href = "/login";
                    } else {
						//TODO: add error message
                        console.error("Failed to logout");
                    }
                } catch (error) {
                    console.error("Logout error:", error);
                }
            });
        }

    }

	if (location === '/callback') {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');
		console.log(code);
	
		try {
			const response = await fetch("/api/callback/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ code }),
			});
	
			if (!response.ok) {
				//TODO: add error message
				throw new Error("Failed to exchange code for token");
			} else {
				const data = await response.json();
				sessionStorage.setItem("token", data.token);
				window.location.href = "/account";
			}
		} catch (error) {
			console.error("Error handling authorization code:", error);
		}
	}
	
    if (location === '/account') {
        try {
            const token = sessionStorage.getItem("token");
            if (!token) {
                throw new Error("Token not found");
            }

            const response = await fetch("/api/user/", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
				sessionStorage.removeItem("token");
				window.location.href = "/login";
				console.error("Failed to fetch user data");
                throw new Error("Failed to fetch user data");
            }

            const userData = await response.json();
			console.log(userData);
			const username = userData.username;
			const avatar = userData.avatar;
			const usernameElement = document.getElementById("username");
			const avatarElement = document.getElementById("avatar");
			const defaultAvatar = "/static/Client/Assets/KippyLabImage.png";
			const avatarIntra = userData.avatar_intra;
			const statusElement = document.getElementById("status");
			
			const GamePlayed = document.getElementById("games-played");
			if (GamePlayed) {
				GamePlayed.textContent = userData.matches.length;
				console.log(userData.matches.length);
			}

			const GameWon = document.getElementById("games-won");
			if (GameWon) {
				GameWon.textContent = userData.matches.filter(match => match.result === "Win").length;
				console.log(userData.matches.filter(match => match.result === "Win").length);
			}

			const GameLost = document.getElementById("games-lost");
			if (GameLost) {
				GameLost.textContent = userData.matches.filter(match => match.result === "Lost").length;
				console.log(userData.matches.filter(match => match.result === "Lost").length);
			}

			const Winrate = document.getElementById("win-rate");
			if (Winrate) {
				const WinNb = userData.matches.filter(match => match.result === "Win").length
				const MatchNb = userData.matches.length
				if (MatchNb === 0) {
					Winrate.textContent = "-";
				} else {
					Winrate.textContent = (WinNb / MatchNb * 100).toFixed(1) + "%";
				}
			}

			if (usernameElement) {
				usernameElement.textContent = `Welcome, ${username}!`;
			}

			if (statusElement) {
				statusElement.textContent = `Status: ${userData.is_active ? "Online" : "Offline"}`;
			}

			if (avatarElement) {
				const avatarPath = avatar !== defaultAvatar ? avatar.replace("/Client", "") : (avatarIntra !== "" ? avatarIntra : defaultAvatar);
				avatarElement.src = avatarPath;
			}
		
			const addFriendForm = document.getElementById("add-friend-form");
			if (addFriendForm) {
				addFriendForm.addEventListener("submit", async (e) => {
					e.preventDefault();
					const formData = new FormData(addFriendForm);
					const friends = formData.get("add-friend");
					console.log(friends);
					try {
						const response = await fetch("/api/add_friends/", {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ friends }),
						});
						if (!response.ok) {
							const responseData = await response.json();
							console.log(responseData);
						
							const errorContainer = document.querySelector('#add-friends-error');
							errorContainer.innerHTML = '';
						
							if (Array.isArray(responseData)) {
								responseData.forEach(errorMessage => {
									const errorElement = document.createElement('div');
									errorElement.textContent = errorMessage;
									errorElement.classList.add('error');
									errorContainer.appendChild(errorElement);
								});
							} else {
								const errorMessage = responseData.detail;
								const errorElement = document.createElement('div');
								errorElement.textContent = errorMessage;
								errorElement.classList.add('error');
								errorContainer.appendChild(errorElement);
							}
						} else {
							const data = await response.json();
							console.log(data);
							pushFriendsList();
						}
						
					} catch (error) {
						console.error("Add friend error:", error);
					}
				});
			}
			
			const OnlineStatusForm = document.getElementById("update-online-status");
			if (OnlineStatusForm) {
				OnlineStatusForm.addEventListener("submit", async (e) => {
					e.preventDefault();
					const formData = new FormData(OnlineStatusForm);
					const status = formData.get("online-status");
					console.log(status);
					try {
						const response = await fetch("/api/update_online_status/", {
							method: "PUT",
						});
						if (!response.ok) {
							const responseData = await response.json();
							console.log(responseData);
						} else {
							const data = await response.json();
							statusElement.textContent = `Status: ${data.is_active ? "Online" : "Offline"}`;
							console.log(data);
						}
					} catch (error) {
						console.error("Update online status error:", error);
					}
				});
			}
			const gameHistoryContainer = document.getElementById("game-history-container");
			gameHistoryContainer.innerHTML = "";

			const gameHistory = userData.matches;
			console.log(gameHistory);
			gameHistory.forEach(match => {
				const matchBox = document.createElement("div");
				matchBox.classList.add("game-history-box");
				matchBox.innerHTML = `
					<h3>${match.opponent}</h3>
					<span>${match.date}</span>
					<span>${match.result}</span>
				`;
				gameHistoryContainer.appendChild(matchBox);
			});
        } catch (error) {
            window.location.href = "/login";
            console.error("Error fetching user data:", error);
        }

		try {
			const token = sessionStorage.getItem("token");
			const friendsList = await fetch("/api/friend_list/", {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${token}`
				},
			});

			if (!friendsList.ok) {
				console.error("Failed to fetch friends list");
				throw new Error("Failed to fetch friends list");
			}

			const friendsData = await friendsList.json();
			console.log(friendsData);
			const friendsListContainer = document.getElementById("friend-list-container");
			friendsListContainer.innerHTML = "";

			// TODO
			friendsData.forEach(friend => {
				const friendBox = document.createElement("div");
				friendBox.classList.add("friend-box");
				friendBox.innerHTML = `
					<img class="friendAvatar" src="" alt="Friend Avatar">
					<h3>${friend.username}</h3>
					<h3>${friend.is_active ? "Online" : "Offline"}</h3>
				`;
				friendsListContainer.appendChild(friendBox);
			
				const defaultAvatar = "/static/Client/Assets/KippyLabImage.png";
				const friendAvatarElements = friendBox.getElementsByClassName("friendAvatar");
				if (friendAvatarElements.length > 0) {
					friendAvatarElements[0].src = friend.avatar !== defaultAvatar ? friend.avatar.replace("/Client", "") : (friend.avatar_intra !== "" ? friend.avatar_intra : defaultAvatar);
				}			
				console.log(friendBox);
			});
		} catch (error) {
			console.error("Error fetching friends list:", error);
		}
    }

    if (location === '/settings') {
		const updateUserForm = document.getElementById("update-user-form");
		if (updateUserForm) {
			updateUserForm.addEventListener("submit", async (e) => {
				e.preventDefault();
				const formData = new FormData(updateUserForm);
				const username = formData.get("username");

				try {
					const response = await fetch("/api/update_user/", {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ username }),
					});
					if (!response.ok) {
						switch (response.status) {
							case 400:
								const responseData = await response.json();
								console.log(responseData);
								const errorElements = [];
								for (const field in responseData) {
									const fieldErrors = responseData[field];
									fieldErrors.forEach(errorMessage => {
										const errorElement = document.createElement('div');
										errorElement.textContent = errorMessage;
										errorElement.classList.add('error');
										errorElements.push(errorElement);
									});
								}
								const errorContainer = document.querySelector('#update-user-error');
								errorContainer.innerHTML = '';

								errorElements.forEach(errorElement => {
									errorContainer.appendChild(errorElement);
								});
								break;
							case 500:
								errorContainer.textContent = 'Server error';
								break;
							default:
								errorContainer.textContent = 'Update user error: Status code ' + response.status;
						}
					} else {
						const data = await response.json();
						sessionStorage.setItem("token", data.token);
						window.location.href = "/account";
					}
				} catch (error) {
					console.error("Update user error:", error);
				}
			});
		}

		const updateAvatarForm = document.getElementById("update-avatar-form");
		if (updateAvatarForm) {
			updateAvatarForm.addEventListener("submit", async (e) => {
				e.preventDefault();
				const formData = new FormData(updateAvatarForm);
				const avatar = formData.get("avatar");
				console.log(avatar);

				try {
					const response = await fetch("/api/update_avatar/", {
						method: "POST",
						"Authorization": "Bearer " + sessionStorage.getItem("token"),
						body: formData,
					});
					const errorContainer = document.querySelector('#avatar-error');
					if (!response.ok) {
						switch (response.status) {
							case 400:
								const responseData = await response.json();
								console.log(responseData);
								const errorElements = [];
								for (const field in responseData) {
									const fieldErrors = responseData[field];
									fieldErrors.forEach(errorMessage => {
										const errorElement = document.createElement('div');
										errorElement.textContent = errorMessage;
										errorElement.classList.add('error');
										errorElements.push(errorElement);
									});
								}
								errorContainer.innerHTML = '';

								errorElements.forEach(errorElement => {
									errorContainer.appendChild(errorElement);
								});
								break;
							case 403:
								errorContainer.textContent = 'No file selected';
								break;
							case 413:
								errorContainer.textContent = 'File too large. Max size is 1MB';
								break;
							case 500:
								errorContainer.textContent = 'Server error';
								break;
							default:
								errorContainer.textContent = 'Update avatar error: Status code ' + response.status;
						}
					} else {
						const data = await response.json();
						sessionStorage.setItem("token", data.token);
						window.location.href = "/account";
					}
				} catch (error) {
					console.error("Update avatar error:", error);
				}
			});
		}

		const OTPContainer = document.getElementById("OTP-container");
		const EnableOTP = document.getElementById("enable-OTP");
		if (OTPContainer && EnableOTP) {
			EnableOTP.addEventListener("click", async (e) => {
				e.preventDefault();
				const response = await fetch("/api/user/", {
					headers: {
						"Authorization": `Bearer ${sessionStorage.getItem("token")}`
					}
				});
				if (!response.ok) {
					OTPContainer.innerHTML = `
						<p>Server Error. Please try again later.</p>
					`;
				}
				const data = await response.json();
				if(data.otp_verified === true) {
					OTPContainer.innerHTML = `
						<p>2FA is already verified on this account.</p>
					`;
				}
				if(data.intra_id !== null) {
					OTPContainer.innerHTML = `
						<p>2FA is not available with 42 login.</p>
						<p>If you want to enable 2FA, please use the one from your 42 account.</p>
					`;
				}

				if (data.intra_id === null && data.otp_verified === false) {
					OTPContainer.innerHTML = `
						<form id="generate-OTP-form" autocomplete="on">
							<h2>2FA Authenticator</h2>
							<br/>
							<p>1. Install Google Authenticator or a similar app on your phone.</p>
							<p>2. Click the button below to generate a QR code.</p>
							<p>2. Open the app and click the '+' button to add an account.</p>
							<p>3. Select 'Scan a QRcode' and scan the QR code below.</p>
							<br/>
							<button class="setting-button" style="transform: translate(-5%);" type="submit">Generate QRcode</button>
						</form>
					`;
				}
				
				const otpForm = document.getElementById("generate-OTP-form");
				if (otpForm) {
					otpForm.addEventListener("submit", async (e) => {
						e.preventDefault();
						try {
							const response = await fetch("/api/generate_otp/", {
								method: "POST",
								"Authorization": "Bearer " + sessionStorage.getItem("token")
							});
							const data = await response.json();
							if (response.ok) {
								const qrCodeElement = document.getElementById("qr-code");
								const qrcodeImg = data.qr_code_base64;
								
								if (qrCodeElement && qrcodeImg) {
									qrCodeElement.src = `data:image/png;base64, ${qrcodeImg}`;
									qrCodeElement.style.display = "block";
									OTPContainer.innerHTML = `
										<form id="verify-OTP-form" autocomplete="on">
											<h2>2FA Authenticator</h2>
											<br/>
											<p>1. Install Google Authenticator or a similar app on your phone.</p>
											<p>2. Click the button below to generate a QR code.</p>
											<p>2. Open the app and click the '+' button to add an account.</p>
											<p>3. Select 'Scan a QRcode' and scan the QR code below.</p>
											<br/>
											<input type="text" id="otp-code" name="otp-code" placeholder="Verify OTP code">
											<button class="setting-button" style="transform: translate(-5%);" type="submit">Verify 2FA</button>
										</form>
									`;
								}
								const verifyOTPForm = document.getElementById("verify-OTP-form");
								if (verifyOTPForm) {
									verifyOTPForm.addEventListener("submit", async (e) => {
										e.preventDefault();
										const formData = new FormData(verifyOTPForm);
										const otpCode = formData.get("otp-code");
										console.log(otpCode);
										try {
											const response = await fetch("/api/verify_otp/", {
												method: "POST",
												headers: {
													"Content-Type": "application/json",
												},
												body: JSON.stringify({ otpCode }),
											});
											const data = await response.json();
											const errorContainer = document.querySelector('#OTP-error');
											if (response.ok) {
												OTPContainer.innerHTML = `<p>${data.message}</p>`;
												qrCodeElement.src = "";
												qrCodeElement.style.display = "none";
											} else {
												errorContainer.textContent = `${data.detail}`;
											}
										} catch (error) {
											console.error("Verify OTP error:", error);
										}
									});
								}
							}
						} catch (error) {
							console.error("Generate OTP error:", error);
						}
					});
				}
			});
		}

		const disableOTPContainer = document.getElementById("disable-OTP-container");
		const disableOTP = document.getElementById("disable-OTP");
		if (disableOTPContainer && disableOTP) {
			disableOTP.addEventListener("click", async (e) => {
				const response = await fetch("/api/user/", {
					headers: {
						"Authorization": `Bearer ${sessionStorage.getItem("token")}`
					}
				});
				if (!response.ok) {
					disableOTPContainer.innerHTML = `
						<p>Server Error. Please try again later.</p>
					`;
				}
				const data = await response.json();
				if(data.otp_verified === false) {
					disableOTPContainer.innerHTML = `
						<p>2FA is not enabled on this account.</p>
					`;
				} else {
					disableOTPContainer.innerHTML = `
						<form id="disable-OTP-form" autocomplete="on">
							<input type="text" id="otp-code" name="otp-code" placeholder="Verify OTP code">
							<button class="setting-button" style="transform: translate(-5%);" type="submit">Verify 2FA</button>
						</form>
					`;
					const disableOTPForm = document.getElementById("disable-OTP-form");
					if (disableOTPForm) {
						disableOTPForm.addEventListener("submit", async (e) => {
							e.preventDefault();
							const formData = new FormData(disableOTPForm);
							const otpCode = formData.get("otp-code");
							console.log(otpCode);
							try {
								const response = await fetch("/api/disable_otp/", {
									method: "POST",
									headers: {
										"Content-Type": "application/json",
									},
									body: JSON.stringify({ otpCode }),
								});
								const data = await response.json();
								const errorContainer = document.querySelector('#disable-OTP-error');
								if (response.ok) {
									disableOTPContainer.innerHTML = `<p>${data.message}</p><br/>`;
								} else {
									errorContainer.textContent = `${data.detail}`;
								}
							} catch (error) {
								console.error("Disable OTP error:", error);
							}
						});
					}
				}
			});
		}

        const deleteUserButton = document.getElementById("delete-user-button");
        if (deleteUserButton) {
            deleteUserButton.addEventListener("click", async () => {
                try {
                    const response = await fetch("/api/delete_user/", {
                        method: "DELETE",
                    });

                    if (response.ok) {
                        sessionStorage.removeItem("token");
                        updateNavbar();
                        window.location.href = "/login";
                    } else {
                        console.error("Failed to delete user");
                    }
                } catch (error) {
                    console.error("Delete user error:", error);
                }
            });
        }
    }

    document.title = route.title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute("content", route.description);
    }

	const pushFriendsList = async () => {
		const token = sessionStorage.getItem("token");
		const friendsList = await fetch("/api/friend_list/", {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${token}`
			},
		});

		if (!friendsList.ok) {
			console.error("Failed to fetch friends list");
			throw new Error("Failed to fetch friends list");
		}

		const friendsData = await friendsList.json();
		console.log(friendsData);
		const friendsListContainer = document.getElementById("friend-list-container");
		friendsListContainer.innerHTML = "";

		friendsData.forEach(friend => {
			const friendBox = document.createElement("div");
			friendBox.classList.add("friend-box");
			friendBox.innerHTML = `
				<img class="friendAvatar" src="" alt="Friend Avatar">
				<h3>${friend.username}</h3>
				<h3>${friend.is_active ? "Online" : "Offline"}</h3>
			`;
			friendsListContainer.appendChild(friendBox);
		
			const defaultAvatar = "/static/Client/Assets/KippyLabImage.png";
			const friendAvatarElements = friendBox.getElementsByClassName("friendAvatar");
			if (friendAvatarElements.length > 0) {
				friendAvatarElements[0].src = friend.avatar !== defaultAvatar ? friend.avatar.replace("/Client", "") : (friend.avatar_intra !== "" ? friend.avatar_intra : defaultAvatar);
			}			
			console.log(friendBox);
		});
	}

    function updateNavbar() {
        const isLoggedIn = !!sessionStorage.getItem("token");
        const dynamicNavLinks = document.querySelector('#dynamic-nav-links');
        if (dynamicNavLinks) {
            dynamicNavLinks.innerHTML = isLoggedIn
                ? '<nav class="navbar"><a href="/"><h1> Transcendence</h1></a><a href="/game">Game</a><a href="/account">Account</a><a id="logout-button">Logout</a><a href="/about">About</a></nav>'
                : '<nav class="navbar"><a href="/"><h1> Transcendence</h1></a><a href="/login">Login</a><a href="/about">About</a></nav>';
        }
        if (isLoggedIn) {
            const logoutButton = document.querySelector('#logout-button');
            if (logoutButton) {
                logoutButton.addEventListener('click', async () => {
                    try {
                        const response = await fetch("/api/logout/", {
                            method: "POST",
                        });
                        if (response.ok) {
                            sessionStorage.removeItem("token");
                            updateNavbar();
                            window.location.href = "/login";
                        } else {
                            console.error("Failed to logout");
                        }
                    } catch (error) {
                        console.error("Logout error:", error);
                    }
                });
            }
        }
    }
    updateNavbar();
};

window.onpopstate = urlLocationHandler;

window.route = urlRoute;

urlLocationHandler();

console.log(document.body)

/*
The difference between localStorage and sessionStorage lies in their respective lifetimes and scopes:

localStorage:
    Data stored using localStorage persists even after the browser window is closed and is available across browser sessions.
    Data stored in localStorage remains until explicitly removed by the web application or cleared by the user through browser settings.
    Data stored in localStorage is shared across all tabs and windows within the same origin (same protocol, domain, and port).

sessionStorage:
    Data stored using sessionStorage persists only for the duration of the page session.
    The data stored in sessionStorage is cleared when the browser tab or window is closed.
    Each tab or window has its own separate sessionStorage, and data stored in one tab/window is not accessible from another tab/window.

Therefore, the choice between localStorage and sessionStorage depends on your application requirements. 
Use localStorage if you want the user to stay logged in across sessions, and use sessionStorage 
if you want the user to be automatically logged out when they close the tab or window.
*/