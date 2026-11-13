import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "backend"))

from backend.app.services.viral_detector import find_viral_segments
from backend.app.services.subtitle_generator import generate_ass_subtitles, group_words_into_punchy_chunks

def test_pipeline():
    print("=== Testing Viral Detection & Subtitle Pipeline ===")
    
    # Mock transcript spanning 3 minutes
    mock_transcript = [
        {"start": 0.0, "duration": 4.0, "end": 4.0, "text": "Hey guys welcome back today we are going to do something normal."},
        {"start": 4.0, "duration": 5.0, "end": 9.0, "text": "Today's video is sponsored by some random company."},
        {"start": 10.0, "duration": 4.0, "end": 14.0, "text": "The secret you won't believe is right here!"},
        {"start": 14.0, "duration": 5.0, "end": 19.0, "text": "Did you know that 99 percent of creators make this exact mistake?"},
        {"start": 19.0, "duration": 6.0, "end": 25.0, "text": "Haha oh my god look at what happened next lmao [laughter]!"},
        {"start": 25.0, "duration": 5.0, "end": 30.0, "text": "Bro are you serious right now this is completely insane!"},
        {"start": 30.0, "duration": 6.0, "end": 36.0, "text": "He literally jumped over the fence and started screaming!"},
        {"start": 36.0, "duration": 7.0, "end": 43.0, "text": "This was the craziest clutch in gaming history no way!"},
        {"start": 43.0, "duration": 6.0, "end": 49.0, "text": "I can not believe he actually survived that challenge!"},
        {"start": 49.0, "duration": 6.0, "end": 55.0, "text": "Wait till the end to see who won the million dollars!"},
        {"start": 55.0, "duration": 5.0, "end": 60.0, "text": "And that is how we broke the world record legend!"},
        {"start": 65.0, "duration": 6.0, "end": 71.0, "text": "Okay now let's just talk about some boring general statistics..."},
    ]
    
    clips = find_viral_segments(
        transcript=mock_transcript,
        video_duration=180.0,
        target_clip_duration=60.0,
        max_clips=2,
        mode="all"
    )
    
    print(f"[✓] Extracted {len(clips)} candidate 60s clips.")
    for idx, c in enumerate(clips):
        print(f"\n--- Clip #{idx+1} ---")
        print(f"Title: {c['title']}")
        print(f"Category: {c['category']}")
        print(f"Viral Index Score: {c['viral_score']}/100 (Hook: {c['hook_score']}/100)")
        print(f"Duration: {c['duration']}s (Start: {c['start']}s -> End: {c['end']}s)")
        print(f"Why it will go viral: {c['why_viral']}")
        print(f"YouTube Shorts Title: {c['youtube_title']}")
        print(f"Words tokenized for subtitles: {len(c['words'])}")
        assert c['duration'] <= 60.0, "Clip exceeded strict 60s limit!"

    # Test subtitle generation
    if clips and clips[0].get('words'):
        test_ass = BASE_DIR / "storage" / "subtitles" / "test_clip.ass"
        generate_ass_subtitles(clips[0]['words'], str(test_ass), style_key="mrbeast_hormozi")
        assert test_ass.exists(), "ASS subtitle file was not generated!"
        print(f"\n[✓] Generated ASS Subtitles: {test_ass}")
        print(f"[✓] ASS Subtitle Size: {test_ass.stat().st_size} bytes")

    print("\n[SUCCESS] Pipeline unit test completed successfully!")

if __name__ == "__main__":
    test_pipeline()
