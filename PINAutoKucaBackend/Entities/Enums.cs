namespace PINAutokucaAPI.Entities
{
    public enum EngineType
    {
        Diesel,
        Benzin,
        Hibrid,
        Elektricni
    }

    public enum CarStatus
    {
        Raspoloziv,
        Prodan,
        Rezerviran,
        Posuden
    }

    public enum TransmissionType
    {
        Mehanicki,
        Automatski
    }

    public enum TransactionType
    {
        Posudba,
        Prodaja
    }
}
