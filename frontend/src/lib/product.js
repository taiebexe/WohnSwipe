const DISTRICT_THEMES = {
    Friedrichshain: {
        gradient: 'linear-gradient(135deg, #1f3245 0%, #ef8354 100%)',
        accent: '#ef8354',
        vibe: 'Creative energy'
    },
    Mitte: {
        gradient: 'linear-gradient(135deg, #263238 0%, #d9a441 100%)',
        accent: '#d9a441',
        vibe: 'City-centre access'
    },
    Kreuzberg: {
        gradient: 'linear-gradient(135deg, #1d3557 0%, #e76f51 100%)',
        accent: '#e76f51',
        vibe: 'Classic Berlin charm'
    },
    Neukolln: {
        gradient: 'linear-gradient(135deg, #183a37 0%, #f4a261 100%)',
        accent: '#f4a261',
        vibe: 'Canal-side momentum'
    },
    'Neukölln': {
        gradient: 'linear-gradient(135deg, #183a37 0%, #f4a261 100%)',
        accent: '#f4a261',
        vibe: 'Canal-side momentum'
    },
    Wedding: {
        gradient: 'linear-gradient(135deg, #2b2d42 0%, #8d99ae 100%)',
        accent: '#8d99ae',
        vibe: 'Room to breathe'
    },
    'Prenzlauer Berg': {
        gradient: 'linear-gradient(135deg, #204051 0%, #84a98c 100%)',
        accent: '#84a98c',
        vibe: 'Family-friendly calm'
    }
};

const FALLBACK_THEMES = [
    {
        gradient: 'linear-gradient(135deg, #2a2d34 0%, #f28482 100%)',
        accent: '#f28482',
        vibe: 'Fresh shortlist'
    },
    {
        gradient: 'linear-gradient(135deg, #1d3557 0%, #a8dadc 100%)',
        accent: '#a8dadc',
        vibe: 'Curated city living'
    },
    {
        gradient: 'linear-gradient(135deg, #2f3e46 0%, #ffb703 100%)',
        accent: '#ffb703',
        vibe: 'Well-balanced option'
    }
];

const COMPLETION_FIELDS = [
    'name',
    'job',
    'bio',
    'moveInDate',
    'maxRent',
    'preferredRooms',
    'districts',
    'tone'
];

const toNumber = (value) => {
    if (value === '' || value === null || value === undefined) {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const toNullableString = (value) => {
    if (value === null || value === undefined) {
        return null;
    }

    const trimmed = String(value).trim();
    return trimmed.length > 0 ? trimmed : null;
};

const hasValue = (value) => {
    if (typeof value === 'boolean') {
        return true;
    }

    if (Array.isArray(value)) {
        return value.length > 0;
    }

    return value !== null && value !== undefined && String(value).trim() !== '';
};

const hashString = (value) => {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 31 + value.charCodeAt(index)) % 2147483647;
    }
    return Math.abs(hash);
};

export function normalizeProfile(data = {}) {
    return {
        name: data.name ?? '',
        age: data.age ?? '',
        job: data.job ?? '',
        netIncomeRange: data.netIncomeRange ?? '',
        moveInDate: data.moveInDate ?? '',
        pets: data.pets ?? '',
        smoker: Boolean(data.smoker),
        bio: data.bio ?? '',
        districts: data.districts ?? '',
        maxRent: data.maxRent ?? '',
        preferredRooms: data.preferredRooms ?? '',
        tone: data.tone ?? 'friendly'
    };
}

export function serializeProfileForApi(profile) {
    return {
        ...profile,
        name: toNullableString(profile.name),
        age: toNumber(profile.age),
        job: toNullableString(profile.job),
        netIncomeRange: toNullableString(profile.netIncomeRange),
        moveInDate: toNullableString(profile.moveInDate),
        pets: toNullableString(profile.pets),
        smoker: Boolean(profile.smoker),
        bio: toNullableString(profile.bio),
        districts: toNullableString(profile.districts),
        maxRent: toNumber(profile.maxRent),
        preferredRooms: toNumber(profile.preferredRooms),
        tone: profile.tone || 'friendly'
    };
}

export function getDistrictList(districts = '') {
    return districts
        .split(',')
        .map((district) => district.trim())
        .filter(Boolean);
}

export function getProfileCompleteness(profile = {}) {
    const completed = COMPLETION_FIELDS.filter((field) => hasValue(profile[field])).length;
    const missing = COMPLETION_FIELDS.filter((field) => !hasValue(profile[field]));

    return {
        completed,
        missing,
        total: COMPLETION_FIELDS.length,
        percentage: Math.round((completed / COMPLETION_FIELDS.length) * 100)
    };
}

export function getListingTheme(listing = {}) {
    if (DISTRICT_THEMES[listing.district]) {
        return DISTRICT_THEMES[listing.district];
    }

    const fallbackIndex = hashString(listing.title ?? listing.district ?? 'WohnSwipe') % FALLBACK_THEMES.length;
    return FALLBACK_THEMES[fallbackIndex];
}

export function getListingFit(listing, profile = {}) {
    const maxRent = toNumber(profile.maxRent);
    const preferredRooms = toNumber(profile.preferredRooms);
    const preferredDistricts = getDistrictList(profile.districts);
    const listingRent = toNumber(listing?.rent);
    const listingRooms = toNumber(listing?.rooms);

    let score = 56;
    const reasons = [];
    const notes = [];

    if (maxRent !== null && listingRent !== null) {
        if (listingRent <= maxRent) {
            score += 18;
            reasons.push(`Inside your ${formatCurrency(maxRent)} budget`);
        } else if (listingRent <= maxRent * 1.08) {
            score += 8;
            notes.push(`Only ${formatCurrency(listingRent - maxRent)} above your budget cap`);
        } else {
            score -= 10;
            notes.push('Likely a stretch on price');
        }
    }

    if (preferredRooms !== null && listingRooms !== null) {
        if (listingRooms >= preferredRooms) {
            score += 14;
            reasons.push(`${listingRooms} rooms meets your space target`);
        } else if (listingRooms >= preferredRooms - 0.5) {
            score += 5;
            notes.push('Slightly tighter than your ideal room count');
        } else {
            score -= 8;
            notes.push('Smaller than your preferred room count');
        }
    }

    if (profile.moveInDate && listing?.availableFrom) {
        const desiredMove = new Date(`${profile.moveInDate}T12:00:00`);
        const availableFrom = new Date(`${listing.availableFrom}T12:00:00`);

        if (availableFrom <= desiredMove) {
            score += 10;
            reasons.push(`Available before your ${formatDate(profile.moveInDate)} move-in target`);
        } else {
            score -= 6;
            notes.push(`Available after your target date`);
        }
    }

    if (preferredDistricts.length > 0 && listing?.district) {
        if (preferredDistricts.includes(listing.district)) {
            score += 16;
            reasons.push(`${listing.district} is one of your preferred districts`);
        } else {
            score -= 4;
            notes.push('Outside your saved district shortlist');
        }
    }

    if (listing?.description) {
        if (listing.description.length >= 110) {
            score += 2;
        }
        if (listing.description.toLowerCase().includes('office') || listing.description.toLowerCase().includes('remote')) {
            reasons.push('Description suggests work-from-home potential');
        }
    }

    const boundedScore = Math.max(48, Math.min(97, Math.round(score)));
    let label = 'Worth a look';

    if (boundedScore >= 86) {
        label = 'Top match';
    } else if (boundedScore >= 76) {
        label = 'Strong fit';
    } else if (boundedScore < 64) {
        label = 'Stretch option';
    }

    return {
        score: boundedScore,
        label,
        reasons: reasons.slice(0, 3),
        notes: notes.slice(0, 2)
    };
}

export function sortListingsByFit(listings, profile) {
    return [...listings].sort((left, right) => {
        const rightFit = getListingFit(right, profile);
        const leftFit = getListingFit(left, profile);

        if (rightFit.score !== leftFit.score) {
            return rightFit.score - leftFit.score;
        }

        return (toNumber(left.rent) ?? 0) - (toNumber(right.rent) ?? 0);
    });
}

export function formatCurrency(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return 'Flexible';
    }

    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    }).format(amount);
}

export function formatDate(value) {
    if (!value) {
        return 'Flexible';
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short'
    }).format(new Date(`${value}T12:00:00`));
}

export function getUserLabel(user) {
    if (!user?.email) {
        return 'Berlin renter';
    }

    const [name] = user.email.split('@');
    return name.replace(/[._-]/g, ' ');
}

export function getProfilePreview(profile = {}) {
    const toneLabel = profile.tone === 'formal' ? 'a structured, polished tone' : 'a warm, personable tone';
    const districtLabel = getDistrictList(profile.districts).slice(0, 2).join(' and ') || 'well-connected Berlin neighbourhoods';
    const jobLabel = profile.job || 'a reliable professional';
    const moveInLabel = profile.moveInDate ? `planning to move around ${formatDate(profile.moveInDate)}` : 'moving on a flexible timeline';

    return `${profile.name || 'This renter'} is ${jobLabel}, ${moveInLabel}, and looking in ${districtLabel}. WohnSwipe will frame inquiry messages in ${toneLabel}.`;
}

export function getTopDistrict(matches = []) {
    if (matches.length === 0) {
        return 'No district yet';
    }

    const counts = matches.reduce((accumulator, match) => {
        const district = match.district || 'Berlin';
        return {
            ...accumulator,
            [district]: (accumulator[district] ?? 0) + 1
        };
    }, {});

    return Object.entries(counts).sort((left, right) => right[1] - left[1])[0][0];
}
