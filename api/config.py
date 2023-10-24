from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    zendesk_host: str = "https://oyika179.zendesk.com/sc"
    zendesk_key_id: str = "app_65368d972be3d115294be513"
    zendesk_secret_key: str = "mIIDlC5TYBF0ZkVtkDTt4xJOdZzB7-6baoppJCb4MLDg_zWwjb_RDVzXBF22KibP4F3L6wb4EnCO0rlRpW_3Bg"
    zendesk_app_id: str = "653630f5da6a21b7e5116952"
