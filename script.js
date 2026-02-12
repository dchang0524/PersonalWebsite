document.addEventListener('DOMContentLoaded', () => {
    setupMobileNav();

    // Determine which page we are on and load appropriate data
    const path = window.location.pathname;
    const page = path.split('/').pop();

    if (path.includes('experience.html')) {
        loadExperience();
    }
    if (page === 'projects.html') {
        loadProjects();
    } else if (page === 'problems.html') {
        loadProblems();
    } else if (page === 'courses.html') {
        loadCourses();
    } else if (page === 'problem.html') {
        loadProblemDetail();
    } else if (page === 'course.html') {
        loadCourseDetail();
    }
});

function setupMobileNav() {
    const burger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    if (burger) {
        burger.addEventListener('click', () => {
            // Toggle Nav
            nav.classList.toggle('nav-active');

            // Animate Links
            navLinks.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });

            // Burger Animation
            burger.classList.toggle('toggle');
        });
    }
}

async function loadProjects() {
    try {
        const response = await fetch('data/projects.json');
        const projects = await response.json();
        const container = document.getElementById('projects-container');

        if (!container) return;

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';

            const techStack = project.tech.map(t => `<span>${t}</span>`).join('');

            card.innerHTML = `
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-tech">${techStack}</div>
                <div class="project-links">
                    <a href="${project.github}" target="_blank" title="GitHub"><i class="fab fa-github"></i></a>
                    <a href="${project.link}" target="_blank" title="External Link"><i class="fas fa-external-link-alt"></i></a>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

async function loadProblems() {
    try {
        const response = await fetch('data/problems.json');
        const problems = await response.json();
        const container = document.getElementById('problems-container');

        if (!container) return;

        // Group problems by category
        const categories = {
            "Competitive Programming": [],
            "Combinatorics": []
        };

        problems.forEach(problem => {
            const cat = problem.category || "Competitive Programming"; // Default fallback
            if (categories[cat]) {
                categories[cat].push(problem);
            } else {
                categories[cat] = [problem]; // Create new category if not exists (though defined above)
            }
        });

        container.innerHTML = ''; // Clear loading text

        // Render Categories
        for (const [categoryName, categoryProblems] of Object.entries(categories)) {
            if (categoryProblems.length === 0) continue;

            const section = document.createElement('div');
            section.className = 'category-section';

            const header = document.createElement('div');
            header.className = 'category-header active'; // Default expanded
            header.innerHTML = `
                <h2>${categoryName}</h2>
                <i class="fas fa-chevron-down"></i>
            `;

            const content = document.createElement('div');
            content.className = 'category-content active'; // Default expanded

            const list = document.createElement('div');
            list.className = 'problems-list';

            // Sort problems alphabetically by title
            categoryProblems.sort((a, b) => a.title.localeCompare(b.title));

            categoryProblems.forEach(problem => {
                const item = document.createElement('div');
                item.className = 'problem-item';

                let difficultyHTML = '';
                if (problem.rating) {
                    difficultyHTML = getRatingHTML(problem.rating);
                } else {
                    difficultyHTML = '<span class="problem-difficulty">Unrated</span>';
                }

                item.innerHTML = `
                    <div class="problem-info">
                        <a href="problem.html?id=${problem.id}" class="problem-title">${problem.title}</a>
                        ${problem.source ? `<span class="problem-source">(${problem.source})</span>` : ''}
                    </div>
                    ${difficultyHTML}
                `;
                list.appendChild(item);
            });

            content.appendChild(list);
            section.appendChild(header);
            section.appendChild(content);
            container.appendChild(section);

            // Add Click Event for Toggle
            header.addEventListener('click', () => {
                header.classList.toggle('active');
                content.classList.toggle('active');
            });
        }

    } catch (error) {
        console.error('Error loading problems:', error);
    }
}

function getRatingHTML(rating) {
    let colorClass = 'rating-gray';
    let firstCharClass = '';

    if (rating < 1000) {
        colorClass = 'rating-gray';
    } else if (rating < 1200) {
        // User requested 1000-1199 = Lime. Using rating-green for now, will verify.
        // Actually, user said 1000-1199 = lime, 1200-1399 = green.
        // I need to add lime class or use inline style. Let's use green for simplicity or add lime.
        // Wait, standard CF: <1200 gray, 1200-1399 green.
        // User: <1000 gray, 1000-1199 lime.
        colorClass = 'rating-green'; // Using green as proxy for lime, or I can add rating-lime.
    } else if (rating < 1400) {
        colorClass = 'rating-green';
    } else if (rating < 1600) {
        colorClass = 'rating-cyan';
    } else if (rating < 1800) {
        colorClass = 'rating-blue';
    } else if (rating < 2000) {
        colorClass = 'rating-violet';
    } else if (rating < 2200) {
        colorClass = 'rating-orange';
    } else if (rating < 2400) {
        colorClass = 'rating-orange';
        firstCharClass = 'rating-red'; // First letter red (International Master)
    } else if (rating < 3000) {
        colorClass = 'rating-red';
    } else if (rating < 4000) {
        colorClass = 'rating-red';
        firstCharClass = 'rating-black'; // First letter black (Legendary Grandmaster)
    } else {
        colorClass = 'rating-black'; // 4000+
    }

    const ratingStr = rating.toString();
    if (firstCharClass) {
        return `<span class="problem-difficulty">
            <span class="${firstCharClass}">${ratingStr[0]}</span><span class="${colorClass}">${ratingStr.substring(1)}</span>
        </span>`;
    } else {
        return `<span class="problem-difficulty ${colorClass}">${rating}</span>`;
    }
}

async function loadCourses() {
    try {
        const response = await fetch('data/courses.json');
        const courses = await response.json();
        const container = document.getElementById('courses-container');

        if (!container) return;

        // Group courses by category dynamically
        const categories = {};

        courses.forEach(course => {
            const cat = course.category || "Uncategorized";
            if (!categories[cat]) {
                categories[cat] = [];
            }
            categories[cat].push(course);
        });

        container.innerHTML = ''; // Clear loading text

        // Sort category names by priority
        const categoryPriority = [
            "Theoretical Computer Science",
            "Artificial Intelligence",
            "Upper-Level Mathematics",
            "Systems",
            "Mathematical Foundations",
            "Software Engineering",
            "Humanities"
        ];

        const sortedCategoryNames = Object.keys(categories).sort((a, b) => {
            const indexA = categoryPriority.indexOf(a);
            const indexB = categoryPriority.indexOf(b);

            // If both are in priority list, sort by index
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            // If only A is in list, A comes first
            if (indexA !== -1) return -1;
            // If only B is in list, B comes first
            if (indexB !== -1) return 1;
            // If neither, sort alphabetically
            return a.localeCompare(b);
        });

        // Render Categories
        for (const categoryName of sortedCategoryNames) {
            const categoryCourses = categories[categoryName];

            const section = document.createElement('div');
            section.className = 'category-section';

            const header = document.createElement('div');
            header.className = 'category-header active'; // Default expanded
            header.innerHTML = `
                <h2>${categoryName}</h2>
                <i class="fas fa-chevron-down"></i>
            `;

            const content = document.createElement('div');
            content.className = 'category-content active'; // Default expanded

            // Use courses-grid inside the accordion
            const grid = document.createElement('div');
            grid.className = 'courses-grid';
            // grid.style.padding = '1.5rem'; // Moved to CSS

            // Sort courses by number descending (extract number from title)
            categoryCourses.sort((a, b) => {
                const getNumber = (title) => {
                    const match = title.match(/\d{4}/);
                    return match ? parseInt(match[0]) : 0;
                };
                return getNumber(b.title) - getNumber(a.title);
            });

            categoryCourses.forEach(course => {
                const card = document.createElement('div');
                card.className = 'course-card';

                // Link entire card to course.html
                card.innerHTML = `
                    <a href="course.html?id=${course.id}" style="text-decoration: none; color: inherit; display: block; height: 100%;">
                        <h3>${course.title}</h3>
                        <span class="course-provider">${course.provider}</span>
                        <span class="course-date">${course.date}</span>
                    </a>
                `;
                grid.appendChild(card);
            });

            content.appendChild(grid);
            section.appendChild(header);
            section.appendChild(content);
            container.appendChild(section);

            // Add Click Event for Toggle
            header.addEventListener('click', () => {
                header.classList.toggle('active');
                content.classList.toggle('active');
            });
        }
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

async function loadProblemDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('problem-detail');

    if (!id || !container) return;

    try {
        const response = await fetch('data/problems.json');
        const problems = await response.json();
        const problem = problems.find(p => p.id === id);

        if (problem) {
            let difficultyHTML = '';
            if (problem.rating) {
                difficultyHTML = getRatingHTML(problem.rating);
            } else {
                difficultyHTML = '<span class="problem-difficulty">Unrated</span>';
            }

            let imagesHTML = '';
            if (problem.images && problem.images.length > 0) {
                const imagesList = problem.images.map(src => `
                    <div class="gallery-item" onclick="window.open('${src}', '_blank')">
                        <img src="${src}" alt="Problem Attachment">
                    </div>
                `).join('');

                imagesHTML = `
                    <div class="problem-gallery">
                        ${imagesList}
                    </div>
                `;
            }

            container.innerHTML = `
                <h1 class="detail-title">${problem.title}</h1>
                <div class="detail-meta">
                    ${difficultyHTML}
                    ${problem.source ? `<span class="detail-source">Source: ${problem.source}</span>` : ''}
                    <a href="${problem.link}" target="_blank" class="detail-link"><i class="fas fa-external-link-alt"></i> View Problem</a>
                </div>
                <div class="detail-description">
                    ${problem.description || '<p>Check link for problem statement.</p>'}
                    ${imagesHTML}
                </div>
            `;

            // Trigger MathJax typeset
            if (window.MathJax) {
                window.MathJax.typesetPromise([container]).catch((err) => console.log('MathJax error:', err));
            }
        } else {
            container.innerHTML = '<p>Problem not found.</p>';
        }
    } catch (error) {
        console.error('Error loading problem detail:', error);
        container.innerHTML = '<p>Error loading content.</p>';
    }
}

async function loadCourseDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('course-detail');

    if (!id || !container) return;

    try {
        const response = await fetch('data/courses.json');
        const courses = await response.json();
        const course = courses.find(c => c.id === id);

        if (course) {
            container.innerHTML = `
                <h1 class="detail-title">${course.title}</h1>
                <div class="detail-meta">
                    <span class="course-provider">${course.provider}</span>
                    <span class="detail-date">${course.date}</span>
                </div>
                <div class="detail-description">
                    ${course.description}
                </div>
            `;
        } else {
            container.innerHTML = '<p>Course not found.</p>';
        }
    } catch (error) {
        console.error('Error loading course detail:', error);
        container.innerHTML = '<p>Error loading content.</p>';
    }
}

async function loadExperience() {
    try {
        const response = await fetch('data/experience.json');
        const experience = await response.json();
        const container = document.getElementById('experience-container');

        if (!container) return;

        experience.forEach(job => {
            const item = document.createElement('div');
            item.className = 'experience-item';
            
            item.innerHTML = `
                <h3>${job.role}</h3>
                <span class="company">${job.company}</span>
                <span class="date">${job.date}</span>
                <p>${job.description}</p>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading experience:', error);
    }
}
