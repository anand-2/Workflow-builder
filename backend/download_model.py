"""
Download and cache the local Gemma-2 model from Hugging Face.
Run once before using LLM_PROVIDER=local_gemma.

Usage:
  pip install torch transformers accelerate
  set HF_TOKEN=your_token   # if the model is gated (Gemma requires accepting license at https://huggingface.co/google/gemma-2-2b)
  python download_model.py
"""
import os
import sys
from pathlib import Path

# Allow running from project root or backend
sys.path.insert(0, str(Path(__file__).resolve().parent))
from dotenv import load_dotenv
load_dotenv()

MODEL_ID = os.getenv("LOCAL_MODEL_ID", "google/gemma-2-2b").strip()
HF_TOKEN = os.getenv("HF_TOKEN", os.getenv("HUGGING_FACE_HUB_TOKEN", "")).strip()


def main():
    print(f"Downloading model: {MODEL_ID}")
    print("(Gemma may require accepting the license at https://huggingface.co/google/gemma-2-2b and setting HF_TOKEN)\n")
    try:
        from transformers import AutoTokenizer, AutoModelForCausalLM
        import torch
    except ImportError:
        print("Missing dependencies. Install with:")
        print("  pip install torch transformers accelerate")
        sys.exit(1)
    kwargs = {"token": HF_TOKEN} if HF_TOKEN else {}
    try:
        print("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, **kwargs)
        print("Loading model (this may take a while and download several GB)...")
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_ID,
            device_map="auto" if torch.cuda.is_available() else None,
            torch_dtype=torch.float32 if not torch.cuda.is_available() else torch.bfloat16,
            **kwargs
        )
        print("Done. Model is cached. Set in .env:")
        print("  LLM_PROVIDER=local_gemma")
        print("Then restart the backend.")
    except Exception as e:
        print(f"Download failed: {e}")
        if "401" in str(e) or "403" in str(e) or "gated" in str(e).lower():
            print("\nThis model may be gated. Steps:")
            print("  1. Go to https://huggingface.co/google/gemma-2-2b")
            print("  2. Accept the license")
            print("  3. Create a token at https://huggingface.co/settings/tokens")
            print("  4. Set HF_TOKEN=your_token in .env or in this terminal")
        sys.exit(1)


if __name__ == "__main__":
    main()
