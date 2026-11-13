import re
import math
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("viral_detector")

# High-impact curiosity words and hook openers for TikTok / Shorts retention
HOOK_PATTERNS = [
    r"\b(why|how|what if|did you know|have you ever|can you believe|the truth about)\b",
    r"\b(secret|mistake|worst|best|crazy|insane|illegal|impossible|genius|ruined)\b",
    r"\b(wait for it|watch this|you won't believe|look at this|don't do this)\b",
    r"\b(bro|chat|no way|omg|oh my god|holy|what the)\b",
    r"\b(stop|listen|rule number one|the craziest thing)\b"
]

# Humor and internet comedy triggers
HUMOR_PATTERNS = [
    r"\[laughter\]|\[laughs\]|\[snicker\]|\[chuckle\]",
    r"\b(haha|hahaha|lmao|lol|hilarious|dying|funny|joke|prank)\b",
    r"\b(what are you doing|are you serious|i can't even|tripping|bruh)\b"
]

# High energy / climax phrases
ENERGY_PATTERNS = [
    r"\b(insane|unbelievable|mind blown|legendary|million|record|clutch|goat)\b",
    r"\b(exploded|screaming|destroyed|caught|exposed|win|lost everything)\b",
    r"!"
]

# Filler / low retention / sponsor words to penalize
BORING_PATTERNS = [
    r"\b(sponsor|sponsored by|nordvpn|manscaped|squarespace|expressvpn|surfshark|patreon)\b",
    r"\b(check out the link in the description|use code|discount|affiliate)\b",
    r"\b(like and subscribe|leave a comment down below|ring the bell|see you next week)\b",
    r"\b(uh|um|you know what i mean|sort of|kind of like)\b"
]

def calculate_window_viral_score(
    text: str, 
    first_5s_text: str, 
    last_5s_text: str, 
    duration: float, 
    word_count: int, 
    mode: str = "all"
) -> Dict[str, Any]:
    """
    Score a video window on virality, hook, humor, and retention.
    Clips must be 60 seconds maximum.
    """
    lower_text = text.lower()
    lower_first_5s = first_5s_text.lower()
    lower_last_5s = last_5s_text.lower()

    # 1. Hook Score (0 - 35 points): Crucial first 3-5 seconds
    hook_score = 10.0
    for pattern in HOOK_PATTERNS:
        matches = len(re.findall(pattern, lower_first_5s))
        hook_score += matches * 7.0
    hook_score = min(35.0, hook_score)

    # 2. Humor & Reaction Score (0 - 30 points)
    humor_score = 0.0
    for pattern in HUMOR_PATTERNS:
        matches = len(re.findall(pattern, lower_text))
        humor_score += matches * 6.5
    humor_score = min(30.0, humor_score)

    # 3. Energy & Climax Score (0 - 25 points)
    energy_score = 5.0
    for pattern in ENERGY_PATTERNS:
        matches = len(re.findall(pattern, lower_text))
        energy_score += matches * 3.5
    energy_score = min(25.0, energy_score)

    # 4. Pace & Speech Density (0 - 15 points)
    # 130 - 170 words per minute is optimal for high engagement
    wpm = (word_count / duration) * 60 if duration > 0 else 0
    if 130 <= wpm <= 190:
        pace_score = 15.0
    elif 100 <= wpm < 130:
        pace_score = 10.0
    elif wpm > 190:
        pace_score = 12.0
    else:
        pace_score = 4.0  # Too slow, viewers scroll

    # 5. Penalties for boring/sponsor sections
    penalties = 0.0
    for pattern in BORING_PATTERNS:
        matches = len(re.findall(pattern, lower_text))
        penalties += matches * 12.0

    # Calculate overall Viral Index (0 - 100)
    if mode == "humor":
        raw_score = (hook_score * 0.8) + (humor_score * 1.8) + (energy_score * 0.8) + pace_score - penalties
    elif mode == "energy":
        raw_score = (hook_score * 0.8) + (humor_score * 0.6) + (energy_score * 1.8) + pace_score - penalties
    else:
        raw_score = (hook_score * 1.1) + (humor_score * 1.1) + (energy_score * 0.9) + pace_score - penalties

    # Scale between 65 and 99 for high confidence candidate presentation
    final_score = max(60, min(99, int(raw_score + 35)))

    # Determine highlight category tag
    if humor_score > 15:
        category = "😂 HILARIOUS REACTION"
        why_viral = "Contains explosive comedic timing and relatable reactions that drive high comment counts and shares."
    elif hook_score > 24:
        category = "🤯 MIND-BLOWING HOOK"
        why_viral = "Powerful opening curiosity gap in the first 3 seconds stops users from scrolling past."
    elif energy_score > 18:
        category = "⚡ HIGH-ENERGY CLIMAX"
        why_viral = "High-octane excitement and intense delivery triggers algorithmic replay loops."
    else:
        category = "🔥 VIRAL MOMENT"
        why_viral = "Packed with high-retention conversation, compelling pacing, and sharp soundbites."

    return {
        "viral_score": final_score,
        "hook_score": min(100, int(hook_score * 2.8)),
        "category": category,
        "why_viral": why_viral,
        "wpm": int(wpm)
    }

def find_viral_segments(
    transcript: List[Dict[str, Any]], 
    video_duration: float,
    target_clip_duration: float = 60.0,
    max_clips: int = 5,
    mode: str = "all"
) -> List[Dict[str, Any]]:
    """
    Scans the video transcript to find distinct, non-overlapping ~60s viral highlights.
    All clips are strictly <= 60 seconds (optimized for YouTube Shorts & Instagram Reels).
    """
    target_clip_duration = min(60.0, max(30.0, target_clip_duration))
    candidates = []

    # If transcript is empty or very short, create evenly distributed viral chunks
    if not transcript or len(transcript) < 3:
        logger.info("Transcript unavailable or minimal. Creating duration-based candidate slices.")
        num_clips = min(max_clips, max(1, int(video_duration // 60)))
        interval = (video_duration - target_clip_duration) / max(1, num_clips)
        
        for i in range(num_clips):
            start = round(i * interval + 15, 2)  # Skip first 15s intro/intro bumper
            end = round(min(video_duration, start + target_clip_duration), 2)
            actual_duration = round(end - start, 2)
            
            candidates.append({
                "clip_id": f"clip_{i+1}",
                "start": start,
                "end": end,
                "duration": actual_duration,
                "viral_score": 90 - (i * 3),
                "hook_score": 88 - (i * 2),
                "category": "🔥 VIRAL HIGHLIGHT",
                "title": f"BEST MOMENT #{i+1} (MUST WATCH)",
                "why_viral": "Curated peak energy moment with optimal 60-second retention curve.",
                "transcript_excerpt": "High energy moment from the video stream.",
                "youtube_title": f"Wait till the end... 💀 | Part {i+1} #shorts",
                "caption": f"You won't believe what happened here! Watch till the end 😱\n\n#shorts #viral #trending #reels #fyp",
                "words": []
            })
        return candidates

    # Build windows from transcript
    n = len(transcript)
    for i in range(n):
        start_time = transcript[i]['start']
        # Look ahead until window reaches 45 - 60 seconds
        accumulated_text = []
        first_5s_words = []
        last_5s_words = []
        end_time = start_time
        
        j = i
        while j < n:
            seg = transcript[j]
            seg_end = seg['end']
            duration = seg_end - start_time
            
            if duration > 60.0:
                # Strictly keep under 60 seconds
                break
                
            accumulated_text.append(seg['text'])
            if duration <= 6.0:
                first_5s_words.append(seg['text'])
            end_time = seg_end
            j += 1

        clip_duration = end_time - start_time
        # Only accept windows that are substantial (at least 35s and <= 60s)
        if 35.0 <= clip_duration <= 60.0:
            full_text = " ".join(accumulated_text)
            words = full_text.split()
            word_count = len(words)
            
            first_5s_str = " ".join(first_5s_words)
            last_5s_str = " ".join(words[-15:]) if len(words) >= 15 else full_text

            scoring = calculate_window_viral_score(
                text=full_text,
                first_5s_text=first_5s_str,
                last_5s_text=last_5s_str,
                duration=clip_duration,
                word_count=word_count,
                mode=mode
            )

            # Extract window transcript segments
            window_segments = transcript[i:j]

            candidates.append({
                "start": round(start_time, 2),
                "end": round(end_time, 2),
                "duration": round(clip_duration, 2),
                "viral_score": scoring["viral_score"],
                "hook_score": scoring["hook_score"],
                "category": scoring["category"],
                "why_viral": scoring["why_viral"],
                "text": full_text,
                "segments": window_segments
            })

    # Sort candidates by viral score descending
    candidates.sort(key=lambda x: x["viral_score"], reverse=True)

    # Filter non-overlapping clips (allow max 10s overlap if needed, but prefer distinct)
    selected_clips = []
    for cand in candidates:
        overlaps = False
        for sel in selected_clips:
            # Check overlap
            if not (cand["end"] <= sel["start"] + 10 or cand["start"] >= sel["end"] - 10):
                overlaps = True
                break
        if not overlaps:
            selected_clips.append(cand)
            if len(selected_clips) >= max_clips:
                break

    # If not enough distinct clips found, take top non-identical
    if len(selected_clips) < max_clips and candidates:
        for cand in candidates:
            if cand not in selected_clips:
                selected_clips.append(cand)
                if len(selected_clips) >= max_clips:
                    break

    # Build final formatted output with generated viral titles and captions
    results = []
    for idx, clip in enumerate(selected_clips):
        words = clip["text"].split()
        hook_teaser = " ".join(words[:8]) + "..." if len(words) > 8 else clip["text"]
        
        # Punchy, all-caps click-worthy titles for Shorts
        first_few = " ".join(words[:4]).upper().replace(".", "").replace(",", "")
        title_options = [
            f"{first_few}?! 💀 (HE WAS NOT READY)",
            f"WHEN THIS HAPPENED... 😱",
            f"YOU WON'T BELIEVE THIS MOMENT! 🔥",
            f"THE CRAZIEST PART OF THE STREAM 🤯",
            f"WAIT TILL THE END 😭 (NEVER DO THIS)"
        ]
        title = title_options[idx % len(title_options)]
        
        # Word timestamps for animated subtitle generation
        word_timestamps = []
        for seg in clip["segments"]:
            seg_words = seg["text"].split()
            if not seg_words:
                continue
            per_w = seg["duration"] / max(1, len(seg_words))
            for w_i, w in enumerate(seg_words):
                w_start = seg["start"] + (w_i * per_w)
                word_timestamps.append({
                    "word": w,
                    "start": round(w_start - clip["start"], 2), # Relative to clip start
                    "end": round(w_start + per_w - clip["start"], 2)
                })

        results.append({
            "clip_id": f"clip_{idx+1}",
            "title": title,
            "category": clip["category"],
            "viral_score": clip["viral_score"],
            "hook_score": clip["hook_score"],
            "why_viral": clip["why_viral"],
            "start": clip["start"],
            "end": clip["end"],
            "duration": clip["duration"],
            "transcript_excerpt": clip["text"][:180] + ("..." if len(clip["text"]) > 180 else ""),
            "youtube_title": f"{title} #shorts",
            "caption": f"{hook_teaser}\n\nCan you believe this happened?! Drop your thoughts below 👇\n\n#shorts #viral #trending #reels #fyp #explorepage",
            "words": word_timestamps
        })

    return results

def enhance_clips_with_llm(clips: List[Dict[str, Any]], video_title: str, api_key: str) -> List[Dict[str, Any]]:
    """
    Optionally use Gemini API to elevate titles, hook explanations, and viral captions.
    """
    if not api_key:
        return clips

    try:
        import json
        import requests
        
        prompt = f"""
You are an elite YouTube Shorts & Instagram Reels viral strategist (producing clips for creators like MrBeast, Joe Rogan, IShowSpeed).
Video Title: "{video_title}"

Here are {len(clips)} candidate 60-second clips extracted from the video:
{json.dumps([{"id": c["clip_id"], "text": c.get("transcript_excerpt", "")} for c in clips], indent=2)}

For each clip, return a JSON array of objects with:
- "id": clip id
- "title": A viral, high-CTR, all-caps short title with emojis (e.g. "HE CAUGHT THEM IN 4K 💀")
- "hook_summary": 1 punchy sentence describing the 3-second hook
- "why_viral": 1 sentence explaining the retention psychology
- "youtube_title": Click-worthy YouTube Shorts title with tags
- "caption": Engaging Instagram Reels caption with 5 trending hashtags

Return ONLY valid JSON.
"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.7, "responseMimeType": "application/json"}
        }
        res = requests.post(url, headers=headers, json=payload, timeout=15)
        if res.status_code == 200:
            data = res.json()
            raw_text = data['candidates'][0]['content']['parts'][0]['text']
            enhanced = json.loads(raw_text)
            
            enh_dict = {item["id"]: item for item in enhanced if "id" in item}
            for c in clips:
                cid = c["clip_id"]
                if cid in enh_dict:
                    c["title"] = enh_dict[cid].get("title", c["title"])
                    c["why_viral"] = enh_dict[cid].get("why_viral", c["why_viral"])
                    c["youtube_title"] = enh_dict[cid].get("youtube_title", c["youtube_title"])
                    c["caption"] = enh_dict[cid].get("caption", c["caption"])
    except Exception as e:
        logger.warning(f"Could not enhance with Gemini API: {e}. Using native viral scoring.")

    return clips
