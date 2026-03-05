(() => {
  const STORAGE_KEYS = {
    categories: "tlfta_blog_categories",
    tags: "tlfta_blog_tags",
    overrides: "tlfta_blog_post_overrides",
    featuredPostId: "tlfta_blog_featured_post_id",
  };

  const DEFAULT_CATEGORIES = [
    "Family Law",
    "Corporate Law",
    "Labor Law",
    "Cybercrime Law",
    "Environmental Law",
    "Civil Law",
    "Arbitration & ADR",
    "Banking & Insurance",
    "Intellectual Property",
    "Taxation",
    "Immigration",
    "Real Estate",
    "General Legal Updates",
  ];

  const DEFAULT_TAGS = [
    "Client Rights",
    "Case Preparation",
    "Compliance",
    "Due Process",
    "Documentation",
    "Legal Strategy",
    "Consultation Tips",
    "Metro Manila",
    "Quezon City",
    "Court Procedure",
    "Mediation",
    "Contracts",
    "Risk Management",
    "Data Privacy",
    "Evidence",
    "Philippine Law",
    "Family Welfare",
    "Workplace Concerns",
    "Business Protection",
    "Regulatory Updates",
  ];

  const TITLE_PATTERNS = [
    "Practical Steps for",
    "What Clients Should Know About",
    "An Introductory Guide to",
    "Essential Notes on",
    "Common Questions on",
  ];

  const SUBTOPICS = [
    "documentation",
    "timelines",
    "compliance",
    "client preparation",
    "preventive legal planning",
    "rights awareness",
    "risk reduction",
  ];

  const ensureArray = (value) => (Array.isArray(value) ? value : []);

  const cleanString = (value) => String(value || "").trim();

  const uniqueStrings = (list) => {
    const output = [];
    const seen = new Set();
    ensureArray(list).forEach((item) => {
      const clean = cleanString(item);
      const key = clean.toLowerCase();
      if (!clean || seen.has(key)) return;
      seen.add(key);
      output.push(clean);
    });
    return output;
  };

  const hash = (value) => {
    let result = 0;
    for (let index = 0; index < value.length; index += 1) {
      result = (result * 31 + value.charCodeAt(index)) >>> 0;
    }
    return result;
  };

  const readJson = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch (error) {
      return fallback;
    }
  };

  const writeJson = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const toIdFromPath = (imagePath) => {
    const filename = imagePath.split("/").pop() || imagePath;
    return filename.replace(/\.[a-z0-9]+$/i, "");
  };

  const formatTitle = (category, seed, index) => {
    const pattern = TITLE_PATTERNS[seed % TITLE_PATTERNS.length];
    const topic = SUBTOPICS[(seed + index) % SUBTOPICS.length];
    return `${pattern} ${category}: ${topic.charAt(0).toUpperCase()}${topic.slice(1)}`;
  };

  const normalizeDate = (value, fallbackDate) => {
    const date = new Date(value || fallbackDate);
    if (Number.isNaN(date.getTime())) return new Date(fallbackDate).toISOString();
    return date.toISOString();
  };

  const pickCategory = (seed) => DEFAULT_CATEGORIES[seed % DEFAULT_CATEGORIES.length] || DEFAULT_CATEGORIES[0];

  const pickTags = (seed) => {
    const first = DEFAULT_TAGS[seed % DEFAULT_TAGS.length];
    const second = DEFAULT_TAGS[(seed + 5) % DEFAULT_TAGS.length];
    const third = DEFAULT_TAGS[(seed + 11) % DEFAULT_TAGS.length];
    return uniqueStrings([first, second, third]).slice(0, 3);
  };

  const getCategories = () => {
    const stored = uniqueStrings(readJson(STORAGE_KEYS.categories, DEFAULT_CATEGORIES));
    if (!stored.length) return [...DEFAULT_CATEGORIES];
    return stored;
  };

  const getTags = () => {
    const stored = uniqueStrings(readJson(STORAGE_KEYS.tags, DEFAULT_TAGS));
    if (!stored.length) return [...DEFAULT_TAGS];
    return stored;
  };

  const getOverrideMap = () => {
    const overrides = readJson(STORAGE_KEYS.overrides, {});
    return overrides && typeof overrides === "object" ? overrides : {};
  };

  const setOverrideMap = (next) => {
    writeJson(STORAGE_KEYS.overrides, next);
  };

  const ensureCategoryExists = (name) => {
    const clean = cleanString(name);
    if (!clean) return;
    const categories = getCategories();
    if (categories.some((item) => item.toLowerCase() === clean.toLowerCase())) return;
    categories.push(clean);
    writeJson(STORAGE_KEYS.categories, categories);
  };

  const ensureTagsExist = (tagList) => {
    const tags = getTags();
    let changed = false;
    uniqueStrings(tagList).forEach((tag) => {
      if (tags.some((item) => item.toLowerCase() === tag.toLowerCase())) return;
      tags.push(tag);
      changed = true;
    });
    if (changed) {
      writeJson(STORAGE_KEYS.tags, tags);
    }
  };

  const buildDefaultPost = (imagePath, index) => {
    const id = toIdFromPath(imagePath);
    const seed = hash(id);
    const category = pickCategory(seed);
    const chosenTags = pickTags(seed);
    const daysBack = index * 3;
    const fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() - daysBack);

    const title = formatTitle(category, seed, index);
    const excerpt = `A practical ${category.toLowerCase()} note focused on ${chosenTags
      .map((tag) => tag.toLowerCase())
      .slice(0, 2)
      .join(" and ")} for clients in the Philippines.`;

    return {
      id,
      imagePath,
      title,
      excerpt,
      lead: `This post highlights practical considerations under Philippine law and outlines initial next steps you can discuss during consultation.`,
      body: `When legal concerns arise, early preparation can reduce risk and delay. Keep records organized, confirm timelines, and seek guidance specific to your facts and jurisdiction.`,
      note: `For case-specific advice, consult counsel before taking action.`,
      category,
      tags: chosenTags,
      dateIso: normalizeDate(fallbackDate.toISOString(), new Date().toISOString()),
    };
  };

  const getPosts = () => {
    const imagePaths = ensureArray(window.TLFTA_FACEBOOK_IMAGES);
    const overrides = getOverrideMap();

    const posts = imagePaths.map((imagePath, index) => {
      const fallback = buildDefaultPost(imagePath, index);
      const override = overrides[fallback.id] || {};

      const category = cleanString(override.category) || fallback.category;
      const mergedTags = uniqueStrings(override.tags || fallback.tags);
      const finalTags = mergedTags.length ? mergedTags.slice(0, 8) : fallback.tags;

      return {
        ...fallback,
        title: cleanString(override.title) || fallback.title,
        excerpt: cleanString(override.excerpt) || fallback.excerpt,
        lead: cleanString(override.lead) || fallback.lead,
        body: cleanString(override.body) || fallback.body,
        note: cleanString(override.note) || fallback.note,
        category,
        tags: finalTags,
        dateIso: normalizeDate(override.dateIso || fallback.dateIso, fallback.dateIso),
      };
    });

    return posts.sort((a, b) => b.dateIso.localeCompare(a.dateIso));
  };

  const getPostById = (id) => getPosts().find((post) => post.id === cleanString(id));

  const getFeaturedPostId = () => cleanString(localStorage.getItem(STORAGE_KEYS.featuredPostId));

  const getFeaturedPost = (posts = getPosts()) => {
    if (!posts.length) return null;
    const storedId = getFeaturedPostId();
    const selected = posts.find((post) => post.id === storedId);
    return selected || posts[0];
  };

  const setFeaturedPostId = (postId) => {
    const id = cleanString(postId);
    if (!id) {
      localStorage.removeItem(STORAGE_KEYS.featuredPostId);
      return true;
    }
    if (!getPostById(id)) return false;
    localStorage.setItem(STORAGE_KEYS.featuredPostId, id);
    return true;
  };

  const formatDisplayDate = (isoDate) => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryCounts = (posts = getPosts()) => {
    const counts = posts.reduce((accumulator, post) => {
      const key = post.category || "Uncategorized";
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    const ordered = uniqueStrings([...getCategories(), ...Object.keys(counts)]);
    return [
      { name: "All Posts", count: posts.length },
      ...ordered.map((name) => ({ name, count: counts[name] || 0 })),
    ];
  };

  const getTagCounts = (posts = getPosts()) => {
    const counts = posts.reduce((accumulator, post) => {
      ensureArray(post.tags).forEach((tag) => {
        const key = cleanString(tag);
        if (!key) return;
        accumulator[key] = (accumulator[key] || 0) + 1;
      });
      return accumulator;
    }, {});

    const ordered = uniqueStrings([...getTags(), ...Object.keys(counts)]);
    return ordered.map((name) => ({ name, count: counts[name] || 0 }));
  };

  const setCategories = (categories) => {
    const cleaned = uniqueStrings(categories);
    writeJson(STORAGE_KEYS.categories, cleaned.length ? cleaned : DEFAULT_CATEGORIES);
  };

  const setTags = (tags) => {
    const cleaned = uniqueStrings(tags);
    writeJson(STORAGE_KEYS.tags, cleaned.length ? cleaned : DEFAULT_TAGS);
  };

  const addCategory = (name) => {
    const clean = cleanString(name);
    if (!clean) return false;
    const categories = getCategories();
    if (categories.some((item) => item.toLowerCase() === clean.toLowerCase())) return false;
    categories.push(clean);
    setCategories(categories);
    return true;
  };

  const addTag = (name) => {
    const clean = cleanString(name);
    if (!clean) return false;
    const tags = getTags();
    if (tags.some((item) => item.toLowerCase() === clean.toLowerCase())) return false;
    tags.push(clean);
    setTags(tags);
    return true;
  };

  const renameCategory = (oldName, nextName) => {
    const oldClean = cleanString(oldName);
    const nextClean = cleanString(nextName);
    if (!oldClean || !nextClean) return false;

    const categories = getCategories();
    const index = categories.findIndex((item) => item.toLowerCase() === oldClean.toLowerCase());
    if (index < 0) return false;

    if (categories.some((item, itemIndex) => itemIndex !== index && item.toLowerCase() === nextClean.toLowerCase())) {
      return false;
    }

    categories[index] = nextClean;
    setCategories(categories);

    const overrides = getOverrideMap();
    Object.keys(overrides).forEach((postId) => {
      const entry = overrides[postId];
      if (cleanString(entry.category).toLowerCase() === oldClean.toLowerCase()) {
        entry.category = nextClean;
      }
    });
    setOverrideMap(overrides);
    return true;
  };

  const renameTag = (oldName, nextName) => {
    const oldClean = cleanString(oldName);
    const nextClean = cleanString(nextName);
    if (!oldClean || !nextClean) return false;

    const tags = getTags();
    const index = tags.findIndex((item) => item.toLowerCase() === oldClean.toLowerCase());
    if (index < 0) return false;

    if (tags.some((item, itemIndex) => itemIndex !== index && item.toLowerCase() === nextClean.toLowerCase())) {
      return false;
    }

    tags[index] = nextClean;
    setTags(tags);

    const overrides = getOverrideMap();
    Object.keys(overrides).forEach((postId) => {
      const entry = overrides[postId];
      const entryTags = uniqueStrings(entry.tags || []);
      if (!entryTags.length) return;
      entry.tags = entryTags.map((tag) =>
        tag.toLowerCase() === oldClean.toLowerCase() ? nextClean : tag
      );
    });
    setOverrideMap(overrides);
    return true;
  };

  const deleteCategory = (name) => {
    const clean = cleanString(name);
    if (!clean) return false;

    const categories = getCategories();
    const nextCategories = categories.filter((item) => item.toLowerCase() !== clean.toLowerCase());
    if (nextCategories.length === categories.length) return false;
    if (!nextCategories.length) nextCategories.push(DEFAULT_CATEGORIES[0]);
    setCategories(nextCategories);

    const fallbackCategory = nextCategories[0];
    const posts = getPosts();
    const overrides = getOverrideMap();

    posts.forEach((post) => {
      if ((post.category || "").toLowerCase() !== clean.toLowerCase()) return;
      const current = overrides[post.id] || {};
      current.category = fallbackCategory;
      overrides[post.id] = current;
    });

    setOverrideMap(overrides);
    return true;
  };

  const deleteTag = (name) => {
    const clean = cleanString(name);
    if (!clean) return false;

    const tags = getTags();
    const nextTags = tags.filter((item) => item.toLowerCase() !== clean.toLowerCase());
    if (nextTags.length === tags.length) return false;
    if (!nextTags.length) nextTags.push(DEFAULT_TAGS[0]);
    setTags(nextTags);

    const posts = getPosts();
    const overrides = getOverrideMap();

    posts.forEach((post) => {
      const nextPostTags = uniqueStrings(post.tags).filter((tag) => tag.toLowerCase() !== clean.toLowerCase());
      const replacementTags = nextPostTags.length ? nextPostTags : [nextTags[0]];
      const current = overrides[post.id] || {};
      current.tags = replacementTags;
      overrides[post.id] = current;
    });

    setOverrideMap(overrides);
    return true;
  };

  const parseTagsInput = (value) =>
    uniqueStrings(String(value || "").split(",").map((tag) => tag.trim())).slice(0, 8);

  const updatePost = (postId, patch) => {
    const id = cleanString(postId);
    if (!id || !patch || typeof patch !== "object") return false;

    const overrides = getOverrideMap();
    const next = { ...(overrides[id] || {}) };

    if (patch.title !== undefined) next.title = cleanString(patch.title);
    if (patch.excerpt !== undefined) next.excerpt = cleanString(patch.excerpt);
    if (patch.lead !== undefined) next.lead = cleanString(patch.lead);
    if (patch.body !== undefined) next.body = cleanString(patch.body);
    if (patch.note !== undefined) next.note = cleanString(patch.note);
    if (patch.dateIso !== undefined) next.dateIso = normalizeDate(cleanString(patch.dateIso), new Date().toISOString());

    if (patch.category !== undefined) {
      next.category = cleanString(patch.category);
      ensureCategoryExists(next.category);
    }

    if (patch.tags !== undefined) {
      const tags = Array.isArray(patch.tags) ? uniqueStrings(patch.tags) : parseTagsInput(patch.tags);
      next.tags = tags;
      ensureTagsExist(tags);
    }

    overrides[id] = next;
    setOverrideMap(overrides);
    return true;
  };

  const resetPostOverride = (postId) => {
    const id = cleanString(postId);
    if (!id) return false;
    const overrides = getOverrideMap();
    if (!overrides[id]) return false;
    delete overrides[id];
    setOverrideMap(overrides);
    return true;
  };

  window.TLFTA_BLOG = {
    getPosts,
    getPostById,
    getFeaturedPost,
    setFeaturedPostId,
    getCategories,
    getTags,
    getCategoryCounts,
    getTagCounts,
    formatDisplayDate,
    parseTagsInput,
    addCategory,
    addTag,
    renameCategory,
    renameTag,
    deleteCategory,
    deleteTag,
    updatePost,
    resetPostOverride,
  };
})();
