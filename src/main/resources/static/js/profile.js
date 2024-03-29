document.addEventListener('DOMContentLoaded', async function () {
    const userId = sessionStorage.getItem('userId');
    const matchId = sessionStorage.getItem('matchId');
    const isCurrentUserProfile = matchId === undefined || matchId === null;
    const profileContainer = document.getElementById('container');
    const profileInfo = document.getElementById('user-info');
    const buttonContainer = document.querySelector('.profile-user-actions');

    const profileLink = document.getElementById('nav-profile');

    if (profileLink) {
        profileLink.addEventListener('click', function() {
            if (sessionStorage.getItem('matchId')) {
                sessionStorage.removeItem('matchId');
            }
        });
    }

    try {
        const userData = await fetchUserData(isCurrentUserProfile);

        updateProfileInfo(userData);

        if (!isCurrentUserProfile) {
            createButton('Message', 'message-button', messageButtonHandler);
            //createButton('Unmatch', 'unmatch-button', unmatchButtonHandler);
        } else {
            createButton('Edit info', 'edit-info-button', editInfoButtonHandler);
            createButton('Logout', 'logout-button', logoutButtonHandler);

            try {
                 const matchesData = await fetchMatchData(userId);
                 createMatchContainer(matchesData);
             } catch (error) {
                 console.error('Error fetching matches:', error);
            }
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }

    function createMatchContainer(matchRequestsData) {
        const matchContainer = document.createElement('div');
        matchContainer.classList.add('match-container');

        const matchesTitle = document.createElement('h2');
        matchesTitle.textContent = 'My Matches';

        const matchesList = document.createElement('ul');
        matchesList.classList.add('matches-list');

        updateMatchesList(matchRequestsData, matchesList);

        matchContainer.appendChild(matchesTitle);
        matchContainer.appendChild(matchesList);
        profileContainer.appendChild(matchContainer);
    }

    function updateMatchesList(matchesData, listElement) {
        listElement.innerHTML = '';

        if (!Array.isArray(matchesData) || matchesData.length === 0) {
            const placeholderItem = document.createElement('li');
            placeholderItem.textContent = 'No current matches';
            listElement.appendChild(placeholderItem);
            return;
        }

        matchesData.forEach(match => {
            if(match.id !== +userId) {
                const listItem = document.createElement('li');
                const profileInfoContainer = document.createElement('div');
                profileInfoContainer.classList.add('profile-info');

                const profilePicture = document.createElement('img');
                profilePicture.src = match.profilePicture ? `data:image/jpeg;base64,${match.profilePicture}` : '../assets/placeholder.png';
                profilePicture.alt = 'Profile Picture';

                const usernameAnchor = document.createElement('a');
                usernameAnchor.href = `/api/profile`;
                usernameAnchor.textContent = match.firstName + ' ' + match.lastName;

                usernameAnchor.addEventListener('click', function(e) {
                    e.preventDefault();

                    sessionStorage.setItem('matchId', match.id);

                    window.location.href = '/api/profile';
                });

                profileInfoContainer.appendChild(profilePicture);
                profileInfoContainer.appendChild(usernameAnchor);

                listItem.appendChild(profileInfoContainer);
                listElement.appendChild(listItem);
            }
        });
    }

    async function fetchUserData(isCurrentUserProfile) {
        const response = await fetch(`/users/${isCurrentUserProfile ? userId : matchId}`);
        return await response.json();
    }

    async function fetchMatchData(id) {
        const response = await fetch(`/matched`);
        return await response.json();
    }

    function updateProfileInfo(user) {
        profileInfo.innerHTML = '';

        const profilePicture = document.createElement('img');
        profilePicture.src = user.profilePicture ? `data:image/jpeg;base64,${user.profilePicture}` : '../assets/placeholder.png';
        profilePicture.alt = 'Profile Picture';

        const nameElement = document.createElement('h3');
        nameElement.textContent = user.firstName + ' ' + user.lastName;

        const genderElement = document.createElement('p');
        genderElement.textContent = user.gender;

        const classElement = document.createElement('p');
        classElement.textContent = `Class of ${user.graduateYear}`;

        const majorElement = document.createElement('p');
        majorElement.textContent = `Major in ${user.major.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}`;

        const interestsElement = document.createElement('p');
        interestsElement.textContent = user.interests ? `Interests: ${user.interests}` : 'No current interests';

        profileInfo.appendChild(profilePicture);
        profileInfo.appendChild(nameElement);
        profileInfo.appendChild(genderElement);
        profileInfo.appendChild(classElement);
        profileInfo.appendChild(majorElement);
        profileInfo.appendChild(interestsElement);
    }

    function createButton(label, className, clickHandler) {
        const button = document.createElement('button');
        button.classList.add(className);
        button.textContent = label;
        buttonContainer.appendChild(button);

        button.addEventListener('click', clickHandler);
    }

    function editInfoButtonHandler() {
        window.location.href = '/api/profile/edit';
    }

    function logoutButtonHandler() {
        (async function () {
            try {
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                window.location.href = '/api/login';
            } catch (error) {
                console.error('Logout failed:', error);
            }
        })();
    }

    function messageButtonHandler() {
        sessionStorage.setItem('receiverId', matchId);
        window.location.href = '/api/chat';
    }
});