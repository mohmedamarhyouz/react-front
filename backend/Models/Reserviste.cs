namespace LocalisationApi.Models;

public class Reserviste
{
    public string Cin { get; set; } = "";
    public string Nom { get; set; } = "";
    public string Prenom { get; set; } = "";
    public string DateNaissance { get; set; } = "";
    public string AdresseReference { get; set; } = "";
    public string StatutMobilisation { get; set; } = "Active";
}
