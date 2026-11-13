import os
import math
from typing import List, Dict, Any
from ..config import SUBTITLE_STYLES, SUBTITLES_DIR

def format_ass_time(seconds: float) -> str:
    """Format seconds into ASS timestamp format: H:MM:SS.cs"""
    seconds = max(0.0, seconds)
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    centis = int(round((seconds - int(seconds)) * 100))
    if centis >= 100:
        centis = 99
    return f"{hours}:{minutes:02d}:{secs:02d}.{centis:02d}"

def group_words_into_punchy_chunks(words: List[Dict[str, Any]], max_words: int = 3) -> List[Dict[str, Any]]:
    """
    Groups word stream into 2-3 word high-retention chunks.
    Short, punchy chunks keep user eyes glued to the screen.
    """
    chunks = []
    if not words:
        return chunks

    i = 0
    while i < len(words):
        chunk_words = words[i:i + max_words]
        start_time = chunk_words[0]["start"]
        end_time = chunk_words[-1]["end"]
        
        # Ensure minimum visible duration (at least 0.4s)
        if end_time - start_time < 0.4:
            end_time = start_time + 0.4
            
        text = " ".join([w["word"].upper() for w in chunk_words])
        
        chunks.append({
            "start": round(start_time, 2),
            "end": round(end_time, 2),
            "text": text,
            "words": chunk_words
        })
        i += max_words

    return chunks

def generate_ass_subtitles(
    words: List[Dict[str, Any]], 
    output_ass_path: str, 
    style_key: str = "mrbeast_hormozi",
    video_width: int = 1080,
    video_height: int = 1920
) -> str:
    """
    Generates an Advanced SubStation Alpha (.ass) file with trendy animations and styling.
    """
    style = SUBTITLE_STYLES.get(style_key, SUBTITLE_STYLES["mrbeast_hormozi"])
    
    chunks = group_words_into_punchy_chunks(words, max_words=3)

    ass_header = f"""[Script Info]
Title: ViralClips Trendy Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709
PlayResX: {video_width}
PlayResY: {video_height}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{style['fontname']},{int(style['fontsize'] * 2.2)},{style['primary_color']},{style['secondary_color']},{style['outline_color']},{style['back_color']},{style['bold']},0,0,0,100,100,1,0,1,{style['outline'] * 2},{style['shadow'] * 2},{style['alignment']},40,40,{int(style['margin_v'] * 4.5)},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    dialogue_lines = []
    for chunk in chunks:
        start_str = format_ass_time(chunk["start"])
        end_str = format_ass_time(chunk["end"])
        
        chunk_words = chunk["words"]
        # Format text with the last word highlighted in neon secondary color
        if len(chunk_words) > 1:
            normal_part = " ".join([w["word"].upper() for w in chunk_words[:-1]])
            highlight_part = chunk_words[-1]["word"].upper()
            formatted_text = f"{normal_part} {{\\c{style['secondary_color']}}}{highlight_part}{{\\c{style['primary_color']}}}"
        else:
            highlight_part = chunk_words[0]["word"].upper()
            formatted_text = f"{{\\c{style['secondary_color']}}}{highlight_part}{{\\c{style['primary_color']}}}"

        # Add subtle pop/bounce scale effect: {\fscx108\fscy108}
        line = f"Dialogue: 0,{start_str},{end_str},Default,,0,0,0,,{{\\fscx108\\fscy108}}{formatted_text}"
        dialogue_lines.append(line)

    full_ass_content = ass_header + "\n".join(dialogue_lines) + "\n"

    with open(output_ass_path, "w", encoding="utf-8") as f:
        f.write(full_ass_content)

    return output_ass_path

def generate_srt_subtitles(words: List[Dict[str, Any]], output_srt_path: str) -> str:
    """Standard SRT export for creators who want clean subtitles for Premiere / CapCut."""
    chunks = group_words_into_punchy_chunks(words, max_words=4)
    srt_lines = []
    
    for idx, c in enumerate(chunks, 1):
        s_h = int(c["start"] // 3600)
        s_m = int((c["start"] % 3600) // 60)
        s_s = int(c["start"] % 60)
        s_ms = int(round((c["start"] - int(c["start"])) * 1000))
        
        e_h = int(c["end"] // 3600)
        e_m = int((c["end"] % 3600) // 60)
        e_s = int(c["end"] % 60)
        e_ms = int(round((c["end"] - int(c["end"])) * 1000))

        start_time_str = f"{s_h:02d}:{s_m:02d}:{s_s:02d},{s_ms:03d}"
        end_time_str = f"{e_h:02d}:{e_m:02d}:{e_s:02d},{e_ms:03d}"

        srt_lines.append(f"{idx}\n{start_time_str} --> {end_time_str}\n{c['text']}\n")

    with open(output_srt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(srt_lines))
        
    return output_srt_path
