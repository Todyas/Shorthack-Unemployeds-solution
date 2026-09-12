import openai

YANDEX_CLOUD_FOLDER = "b1gcckd2llp6t0dj6j6e"
YANDEX_CLOUD_API_KEY = "***…m63s0K"
YANDEX_CLOUD_MODEL = "deepseek-v4-flash/latest"

client = openai.OpenAI(
	api_key=YANDEX_CLOUD_API_KEY,
	base_url="https://ai.api.cloud.yandex.net/v1",
	project=YANDEX_CLOUD_FOLDER
)

response = client.responses.create(
	model=f"gpt://{YANDEX_CLOUD_FOLDER}/{YANDEX_CLOUD_MODEL}",
	temperature=0.3,
	instructions="",
	input="",
	max_output_tokens=1500
)

print(response.output_text)