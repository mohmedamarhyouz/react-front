namespace LocalisationApi.Models;

public class CampagneLocalisation
{
    public int Id { get; set; }
    public string Nom { get; set; } = "";
    public string DateDebut { get; set; } = "";
    public string DateFin { get; set; } = "";
    public string Statut { get; set; } = "Planifiee";
}
