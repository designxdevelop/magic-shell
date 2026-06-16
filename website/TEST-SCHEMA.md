# Quick Schema Testing Guide

## 🚀 Quick Test (5 minutes)

### 1. Build the Site

```bash
cd website
npm run build
npm run preview
```

### 2. View Schema in Browser

1. Open http://localhost:4321
2. Right-click → "View Page Source"
3. Search for `application/ld+json` (Cmd/Ctrl+F)
4. You should see 2 JSON-LD blocks:
   - First block: Organization, WebSite, SoftwareApplication, HowTo
   - Second block: FAQPage

### 3. Copy and Validate

**Option A: Google Rich Results Test**

```
1. Go to: https://search.google.com/test/rich-results
2. Click "Code" tab
3. Paste your entire HTML (or just the JSON-LD)
4. Click "Test Code"
5. Check for errors
```

**Option B: Schema.org Validator**

```
1. Go to: https://validator.schema.org/
2. Paste just the JSON-LD content
3. Click "Run Test"
4. Review results
```

## ✅ What to Check

### Homepage Schema

**Organization:**

- ✅ Name: "Magic Shell"
- ✅ URL: https://mshell.dev
- ✅ Logo present
- ✅ GitHub link in sameAs

**WebSite:**

- ✅ SearchAction present
- ✅ URL template includes {search_term_string}

**SoftwareApplication:**

- ✅ Name: "Magic Shell"
- ✅ Version: "0.2.22"
- ✅ Price: "0"
- ✅ Operating systems listed
- ✅ 10 features in featureList
- ✅ Download URL (npm)
- ✅ Code repository URL

**HowTo:**

- ✅ 3 steps present
- ✅ Total time: "PT5M"
- ✅ Each step has directions

**FAQPage:**

- ✅ 10 questions present
- ✅ Each has acceptedAnswer
- ✅ Answers are accurate

### Documentation Pages

1. Visit: http://localhost:4321/getting-started/installation/
2. View source
3. Check for:
   - ✅ TechArticle schema
   - ✅ BreadcrumbList schema
   - ✅ Organization reference

## 🐛 Common Issues

### Issue: "Invalid JSON"

**Fix:** Check for:

- Trailing commas
- Unescaped quotes in strings
- Missing closing brackets

### Issue: "Missing required property"

**Fix:** Add the required property to Schema.astro

### Issue: "Invalid URL"

**Fix:** Ensure all URLs start with https://mshell.dev

## 📊 Expected Validation Results

### Google Rich Results Test

```
✅ Valid items detected:
   - SoftwareApplication
   - HowTo
   - FAQPage
   - Organization
   - WebSite

⚠️ Warnings: 0-2 (warnings are OK)
❌ Errors: 0 (must be zero)
```

### Schema.org Validator

```
✅ JSON-LD syntax: Valid
✅ Schema types: Recognized
⚠️ Recommendations: May have some (optional improvements)
```

## 🎯 Production Testing

After deploying to production:

```bash
# Test production URL
curl https://mshell.dev | grep -A 100 "application/ld+json"

# Or use online tools:
# 1. Google Rich Results Test: https://search.google.com/test/rich-results
#    Enter: https://mshell.dev
#
# 2. Schema.org Validator: https://validator.schema.org/
#    Enter: https://mshell.dev
```

## 📝 Quick Checklist

Before marking as complete:

- [ ] Built site locally
- [ ] Viewed schema in page source
- [ ] Validated with Google Rich Results Test
- [ ] Validated with Schema.org Validator
- [ ] No critical errors
- [ ] All URLs are fully qualified
- [ ] Version number is current
- [ ] FAQ answers are accurate
- [ ] Tested documentation pages
- [ ] robots.txt is accessible

## 🎉 Success Criteria

Your schema is ready when:

1. ✅ No errors in Google Rich Results Test
2. ✅ All 5 schema types detected on homepage
3. ✅ Valid JSON-LD syntax
4. ✅ All URLs are fully qualified
5. ✅ Content matches schema data
6. ✅ Documentation pages have schema

## 📞 Need Help?

If validation fails:

1. Check the error message
2. Review SCHEMA-VALIDATION.md for troubleshooting
3. Verify JSON syntax with a JSON validator
4. Ensure all required properties are present
5. Check that URLs are fully qualified

## 🚢 Ready to Deploy?

Once all checks pass:

```bash
# Deploy to production
npm run build

# After deployment:
# 1. Test production URL with validation tools
# 2. Submit sitemap to Google Search Console
# 3. Monitor for errors in Search Console
# 4. Wait 1-2 weeks for rich results to appear
```

---

**Quick Links:**

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- [Implementation Details](./SCHEMA-IMPLEMENTATION.md)
- [Validation Guide](./SCHEMA-VALIDATION.md)
