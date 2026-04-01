"""main.py — Day 9: Token 计数演示"""
from token_counter import TokenCounter

def main():
    counter = TokenCounter()
    text = "Hello, Claude! This is a test message for token counting."
    tokens = counter.count(text)
    print(f"文本: {text}")
    print(f"Token 数: {tokens}")

    cost = counter.estimate_cost(input_tokens=1000, output_tokens=500, model="claude-sonnet-4-6")
    print(f"估算成本: ${cost:.4f}")

    counter.record(1000, 500)
    counter.record(2000, 1000)
    print(counter.summary())

if __name__ == "__main__":
    main()
